import apiJava from './apiJava'
import apiDotNet from './apiDotNet'

export const obtenerMiUsuario = async (id) => (await apiDotNet.get(`/api/users/${id}`)).data

export async function guardarMisDatos({ nombre, correo, telefono }) {
  return (await apiDotNet.put('/api/users/me', {
    nombre: nombre.trim(), correo: correo.trim(), telefono: telefono.trim(),
  })).data.user
}

export async function obtenerMiPerfil(id) {
  try { return (await apiJava.get(`/api/perfiles-administrador/administrador/${id}`)).data }
  catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

export async function subirFoto(archivo) {
  const form = new FormData()
  form.append('archivo', archivo)
  return (await apiJava.post('/api/imagenes/perfil', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data.fotoUrl
}

export async function guardarFoto(fotoUrl, existePerfil) {
  return existePerfil
    ? (await apiJava.put('/api/perfiles-administrador/mi-perfil', { fotoUrl })).data
    : (await apiJava.post('/api/perfiles-administrador', { fotoUrl })).data
}
