const roles = new Set(['CLIENTE', 'TRABAJADOR', 'ADMINISTRADOR', 'ADMINISTRADORPRINCIPAL'])
const rolesPorId = { 1: 'CLIENTE', 2: 'TRABAJADOR', 3: 'ADMINISTRADOR', 4: 'ADMINISTRADORPRINCIPAL' }

export function rolDeUsuario(usuario) {
  const rol = String(usuario?.rol ?? usuario?.Rol ?? '').toUpperCase()
  return roles.has(rol) ? rol : rolesPorId[usuario?.rolId ?? usuario?.RolId] ?? ''
}

export const claveAvatar = (id, rol) => `${String(rol ?? '').toUpperCase()}:${Number(id)}`

export function consultasAvatar(usuarios) {
  const unicos = new Map()
  for (const usuario of usuarios) {
    const usuarioId = Number(usuario?.usuarioId ?? usuario?.id ?? usuario?.Id)
    const rol = rolDeUsuario(usuario)
    if (Number.isSafeInteger(usuarioId) && usuarioId > 0 && rol) {
      unicos.set(claveAvatar(usuarioId, rol), { usuarioId, rol })
    }
  }
  return [...unicos.values()].sort((a, b) => claveAvatar(a.usuarioId, a.rol).localeCompare(claveAvatar(b.usuarioId, b.rol)))
}

export async function cargarFotosEnLote(usuarios, consultar) {
  const consultas = consultasAvatar(usuarios)
  const fotos = {}
  for (let i = 0; i < consultas.length; i += 200) {
    const resultado = await consultar({ usuarios: consultas.slice(i, i + 200) })
    for (const foto of resultado) fotos[claveAvatar(foto.usuarioId, foto.rol)] = foto.fotoUrl ?? null
  }
  return fotos
}

export function iniciales(nombre) {
  return Array.from(String(nombre ?? '').trim())[0]?.toLocaleUpperCase('es') || ''
}
