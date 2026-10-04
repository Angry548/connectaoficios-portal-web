import { jwtDecode } from 'jwt-decode'
import apiDotNet from './apiDotNet'

const TOKEN_KEY = 'adminToken'
const USER_KEY = 'adminUser'

const normalizarUsuario = (usuario) => {
  if (!usuario) {
    return null
  }

  return {
    id: usuario.id ?? usuario.Id,
    nombre: usuario.nombre ?? usuario.Nombre ?? '',
    correo: usuario.correo ?? usuario.Correo ?? '',
    telefono: usuario.telefono ?? usuario.Telefono ?? null,
    rolId: usuario.rolId ?? usuario.RolId,
    rol: usuario.rol ?? usuario.Rol ?? '',
    estado: usuario.estado ?? usuario.Estado ?? '',
    fechaCreacion:
      usuario.fechaCreacion ??
      usuario.FechaCreacion ??
      null,
  }
}

const obtenerRolToken = (token) => {
  try {
    const payload = jwtDecode(token)

    return (
      payload.role ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      ''
    )
  } catch {
    return ''
  }
}

const tokenExpirado = (token) => {
  try {
    const payload = jwtDecode(token)

    if (!payload.exp) {
      return false
    }

    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

const esRolAdministrativo = (rol) => {
  return (
    rol === 'Administrador' ||
    rol === 'AdministradorPrincipal'
  )
}

const iniciarSesion = async (correo, password) => {
  const response = await apiDotNet.post('/api/users/login', {
    correo: correo.trim(),
    password,
  })

  const token =
    response.data?.token ??
    response.data?.Token

  const usuario = normalizarUsuario(
    response.data?.usuario ??
    response.data?.Usuario,
  )

  if (!token || !usuario) {
    throw new Error(
      'La respuesta del servidor no contiene una sesión válida.',
    )
  }

  const rolToken = obtenerRolToken(token)
  const rol = usuario.rol || rolToken

  if (!esRolAdministrativo(rol)) {
    throw new Error(
      'Esta cuenta no tiene acceso al portal administrativo.',
    )
  }

  const usuarioSesion = {
    ...usuario,
    rol,
  }

  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(
    USER_KEY,
    JSON.stringify(usuarioSesion),
  )

  return {
    token,
    usuario: usuarioSesion,
  }
}

const cerrarSesion = () => {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

const obtenerToken = () => {
  return sessionStorage.getItem(TOKEN_KEY)
}

const obtenerUsuario = () => {
  const contenido = sessionStorage.getItem(USER_KEY)

  if (!contenido) {
    return null
  }

  try {
    return JSON.parse(contenido)
  } catch {
    sessionStorage.removeItem(USER_KEY)
    return null
  }
}

const obtenerSesion = () => {
  const token = obtenerToken()
  const usuario = obtenerUsuario()

  if (!token || !usuario) {
    return null
  }

  if (tokenExpirado(token)) {
    cerrarSesion()
    return null
  }

  const rolToken = obtenerRolToken(token)
  const rol = usuario.rol || rolToken

  if (!esRolAdministrativo(rol)) {
    cerrarSesion()
    return null
  }

  return {
    token,
    usuario: {
      ...usuario,
      rol,
    },
  }
}

const cambiarPassword = async (
  currentPassword,
  newPassword,
) => {
  const response = await apiDotNet.put(
    '/api/users/me/password',
    {
      currentPassword,
      newPassword,
    },
  )

  return response.data
}

export const authService = {
  iniciarSesion,
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
  obtenerSesion,
  cambiarPassword,
  esRolAdministrativo,
}

export default authService