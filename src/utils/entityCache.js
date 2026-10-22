// Per-view cache: share pending lookups, remember missing entities, retry real failures.
export default function createEntityCache(load, { ttl = 300000, limit = 300 } = {}) {
  const entries = new Map()
  const trim = () => {
    while (entries.size > limit) entries.delete(entries.keys().next().value)
  }
  return {
    seed(entity) {
      const id = entity?.id ?? entity?.Id
      if (id == null) return
      entries.set(String(id), { expires: Date.now() + ttl, promise: Promise.resolve(entity) })
      trim()
    },
    get(id) {
      if (id == null || id === '') return Promise.resolve(null)
      const key = String(id)
      const cached = entries.get(key)
      if (cached && cached.expires > Date.now()) return cached.promise
      const entry = { expires: Date.now() + ttl }
      entry.promise = Promise.resolve().then(() => load(id)).then((entity) => {
        // Existing services translate 404 to null. Retain this negative result
        // until eviction or view disposal, independently of the positive TTL.
        if (entity == null) entry.expires = Infinity
        return entity ?? null
      }).catch((error) => {
        // Also support loaders that propagate the original HTTP 404.
        if (error?.response?.status === 404) {
          entry.expires = Infinity
          return null
        }
        if (entries.get(key) === entry) entries.delete(key)
        throw error
      })
      entries.set(key, entry)
      trim()
      return entry.promise
    },
  }
}

export async function resolveEntityNames(rows, cache, idField, readName) {
  const ids = [...new Set(rows.map((row) => row[idField]).filter((id) => id != null && id !== '').map(String))]
  const names = {}
  let failed = false
  let cursor = 0
  // The APIs have no batch-by-ID endpoint. Bound concurrency for unique cache misses.
  await Promise.all(Array.from({ length: Math.min(4, ids.length) }, async () => {
    while (cursor < ids.length) {
      const id = ids[cursor++]
      try {
        const entity = await cache.get(id)
        if (entity == null) continue
        const name = entity ? readName(entity) : ''
        if (name) names[id] = name
        else failed = true
      } catch { failed = true }
    }
  }))
  return { names, failed }
}
