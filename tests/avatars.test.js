import test from 'node:test'
import assert from 'node:assert/strict'
import { cargarFotosEnLote, consultasAvatar, claveAvatar, iniciales } from '../src/utils/avatars.js'

test('50 usuarios generan una sola llamada y conservan roles y fotos nulas', async () => {
  let llamadas = 0
  const usuarios = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, rol: ['Cliente', 'Trabajador', 'Administrador', 'AdministradorPrincipal'][i % 4] }))
  const fotos = await cargarFotosEnLote(usuarios, async ({ usuarios: lote }) => {
    llamadas++
    assert.equal(lote.length, 50)
    return lote.map((u) => ({ ...u, fotoUrl: u.usuarioId === 1 ? 'foto.png' : null }))
  })
  assert.equal(llamadas, 1)
  assert.equal(fotos[claveAvatar(1, 'Cliente')], 'foto.png')
  assert.equal(fotos[claveAvatar(2, 'Trabajador')], null)
})

test('deduplica sin cruzar fotos de roles y admite el formato .NET', () => {
  const consultas = consultasAvatar([{ Id: 1, RolId: 1 }, { id: 1, rol: 'Cliente' }, { id: 1, rol: 'Trabajador' }, null, { id: 0, rol: 'Cliente' }])
  assert.equal(consultas.length, 2)
  assert.notEqual(claveAvatar(1, 'Cliente'), claveAvatar(1, 'Trabajador'))
})

test('lote vacío no hace llamadas y lotes grandes respetan límite', async () => {
  let llamadas = 0
  await cargarFotosEnLote([], async () => { throw Error('No debería consultar') })
  await cargarFotosEnLote(Array.from({ length: 201 }, (_, i) => ({ id: i + 1, rol: 'Cliente' })), async ({ usuarios }) => {
    llamadas++
    assert.ok(usuarios.length <= 200)
    return []
  })
  assert.equal(llamadas, 2)
})

test('errores de red se propagan para informar y permitir reintento', async () => {
  await assert.rejects(cargarFotosEnLote([{ id: 1, rol: 'Cliente' }], async () => { throw Error('Sin conexión') }))
})

test('iniciales sin fotografías inventadas', () => {
  assert.equal(iniciales('Ana María'), 'A')
  assert.equal(iniciales('Luis'), 'L')
  assert.equal(iniciales(''), '')
})


test('mapea foto con ID string/number y rol Java sin cruzar personas', async () => {
 const fotos = await cargarFotosEnLote([{ id: '007', rol: 'Cliente' }, { id: 8, rol: 'Trabajador' }], async ({ usuarios }) => {
  assert.deepEqual(usuarios, [{ usuarioId: 7, rol: 'CLIENTE' }, { usuarioId: 8, rol: 'TRABAJADOR' }])
  return [{ usuarioId: '7', rol: 'CLIENTE', fotoUrl: 'https://example.test/foto.png' }, { usuarioId: 8, rol: 'TRABAJADOR', fotoUrl: null }]
 })
 assert.equal(fotos[claveAvatar('007', 'Cliente')], 'https://example.test/foto.png')
 assert.equal(fotos[claveAvatar(8, 'Trabajador')], null)
})
