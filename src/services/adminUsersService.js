import apiDotNet from './apiDotNet'

const obtenerUsuarios = async ({
  nombre = '',
  correo = '',
  rolId = '',
  estado = '',
  page = 1,
  pageSize = 20,
} = {}) => {
  const params = {
    page,
    pageSize,
  }

  if (nombre.trim()) {
    params.nombre =
      nombre.trim()
  }

  if (correo.trim()) {
    params.correo =
      correo.trim()
  }

  if (rolId !== '') {
    params.rolId =
      Number(rolId)
  }

  if (estado !== '') {
    params.estado =
      Number(estado)
  }

  const response =
    await apiDotNet.get(
      '/api/admin/users',
      {
        params,
      },
    )

  return response.data
}

const buscarUsuarios = async (
  texto,
  rolId = null,
  limit = 10,
) => {
  const textoLimpio =
    texto?.trim() || ''

  if (textoLimpio.length < 2) {
    return []
  }

  const params = {
    texto: textoLimpio,
    limit,
  }

  if (rolId !== null) {
    params.rolId =
      Number(rolId)
  }

  const response =
    await apiDotNet.get(
      '/api/admin/users/search',
      {
        params,
      },
    )

  return response.data
}

const obtenerUsuarioPorId =
  async (id) => {
    const response =
      await apiDotNet.get(
        `/api/admin/users/${id}`,
      )

    return response.data
  }

const cambiarEstado = async (
  id,
  estado,
) => {
  const response =
    await apiDotNet.patch(
      `/api/admin/users/${id}/status`,
      {
        estado,
      },
    )

  return response.data
}

const adminUsersService = {
  obtenerUsuarios,
  buscarUsuarios,
  obtenerUsuarioPorId,
  cambiarEstado,
}

export default adminUsersService