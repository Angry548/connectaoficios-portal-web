import apiJava from './apiJava'
import { cargarFotosEnLote, consultasAvatar, claveAvatar } from '../utils/avatars'
const cache = new Map()
const pending = new Map()
let generation = 0
export async function obtenerFotos(usuarios) {
 const consultas = consultasAvatar(usuarios)
 const token = sessionStorage.getItem('adminToken') || ''
 const keyOf = (u) => token + ':' + claveAvatar(u.usuarioId, u.rol)
 const faltantes = consultas.filter((u) => (cache.get(keyOf(u))?.expires || 0) <= Date.now())
 if (faltantes.length) {
  const key = JSON.stringify([token, generation, faltantes])
  if (!pending.has(key)) {
   const current = generation
   const request = cargarFotosEnLote(faltantes, async (consulta) => (await apiJava.post('/api/perfiles/fotos', consulta)).data).then((fotos) => {
    if (current !== generation) return
    for (const u of faltantes) cache.set(keyOf(u), { foto: fotos[claveAvatar(u.usuarioId, u.rol)] ?? null, expires: Date.now() + 300000 })
   }).finally(() => pending.delete(key))
   pending.set(key, request)
  }
  await pending.get(key)
 }
 return Object.fromEntries(consultas.map((u) => [claveAvatar(u.usuarioId, u.rol), cache.get(keyOf(u))?.foto ?? null]))
}
export function invalidarFotos(usuarios) {
 const token = sessionStorage.getItem('adminToken') || ''
 for (const u of consultasAvatar(usuarios)) cache.delete(token + ':' + claveAvatar(u.usuarioId, u.rol))
}
export function notificarFotoActualizada() {
 generation++
 cache.clear()
 window.dispatchEvent(new Event('user-avatar-updated'))
}
