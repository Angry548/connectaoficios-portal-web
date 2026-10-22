import assert from 'node:assert/strict'
import test from 'node:test'
import createEntityCache, { resolveEntityNames } from '../src/utils/entityCache.js'

test('duplicate and simultaneous ID lookups share one request', async () => {
  let calls = 0
  const cache = createEntityCache(async (id) => { calls++; return { id, titulo: 'Instalación eléctrica' } })
  const [first, second] = await Promise.all([cache.get(7), cache.get('7')])
  assert.equal(first, second)
  await cache.get(7)
  assert.equal(calls, 1)
})

test('search results seed the cache and failed requests can be retried', async () => {
  let calls = 0
  const cache = createEntityCache(async () => { calls++; if (calls === 1) throw new Error('offline'); return { nombre: 'Juan Pérez' } })
  cache.seed({ Id: 3, Nombre: 'Carlos Hernández' })
  assert.equal((await cache.get(3)).Nombre, 'Carlos Hernández')
  assert.equal(calls, 0)
  await assert.rejects(cache.get(7))
  assert.equal((await cache.get(7)).nombre, 'Juan Pérez')
  assert.equal(calls, 2)
})

test('expired and evicted entries are fetched again', async () => {
  let calls = 0
  const cache = createEntityCache(async (id) => { calls++; return { id } }, { ttl: 0 })
  await cache.get(7); await cache.get(7)
  assert.equal(calls, 2)
  const bounded = createEntityCache(async (id) => { calls++; return { id } }, { limit: 1 })
  await bounded.get(1); await bounded.get(2); await bounded.get(1)
  assert.equal(calls, 5)
})

test('names are resolved once per unique ID, with bounded concurrency and partial failures', async () => {
  let calls = 0
  let active = 0
  let maximum = 0
  const cache = createEntityCache(async (id) => {
    calls++; active++; maximum = Math.max(maximum, active)
    await Promise.resolve()
    active--
    if (id === '3') throw new Error('offline')
    if (id === '4') return null
    return { titulo: `Servicio ${id}` }
  })
  const rows = [1, 2, 2, 3, 4, 5, 6, 7, 8].map((id) => ({ servicioId: id }))
  const result = await resolveEntityNames(rows, cache, 'servicioId', (entity) => entity.titulo)
  assert.equal(calls, 8)
  assert.ok(maximum <= 4)
  assert.equal(result.names[2], 'Servicio 2')
  assert.equal(result.names[3], undefined)
  assert.equal(result.names[4], undefined)
  assert.equal(result.failed, true)
  await resolveEntityNames(rows, cache, 'servicioId', (entity) => entity.titulo)
  assert.equal(calls, 9) // Only the failed request is retried.
})

test('historical 404 and null relations use fallbacks without reporting a general failure', async () => {
  for (const idField of ['servicioId', 'trabajadorId']) {
    let calls = 0
    const cache = createEntityCache(async (id) => {
      calls++
      if (id === '2') throw { response: { status: 404 } }
      if (id === '3') return null // Existing API services normalize 404 this way.
      return { nombre: `Nombre ${id}` }
    }, { ttl: 0 })
    const rows = [2, 2, 3, 7].map((id) => ({ [idField]: id }))
    const first = await resolveEntityNames(rows, cache, idField, (entity) => entity.nombre)
    assert.equal(first.failed, false)
    assert.deepEqual(first.names, { 7: 'Nombre 7' })
    assert.equal(calls, 3)
    const second = await resolveEntityNames(rows, cache, idField, (entity) => entity.nombre)
    assert.equal(second.failed, false)
    assert.equal(calls, 4) // Positive TTL expired; both missing IDs stay cached.
  }
})

test('network, timeout, 500 and permission failures remain failures and can be retried', async () => {
  for (const error of [{ code: 'ERR_NETWORK' }, { code: 'ECONNABORTED' }, { response: { status: 500 } }, { response: { status: 401 } }, { response: { status: 403 } }]) {
    let calls = 0
    const cache = createEntityCache(async () => { calls++; throw error })
    const rows = [{ servicioId: 2 }]
    assert.equal((await resolveEntityNames(rows, cache, 'servicioId', (entity) => entity.titulo)).failed, true)
    await resolveEntityNames(rows, cache, 'servicioId', (entity) => entity.titulo)
    assert.equal(calls, 2)
  }
})
