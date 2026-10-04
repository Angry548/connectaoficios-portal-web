import apiDotNet from './apiDotNet'

const obtenerAdministradores =
  async ({
    nombre = '',
    correo = '',
    rolId = '',
    estado = '',
    page = 1,
    pageSize = 10,
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
        '/api/admin/accounts',
        {
          params,
        },
      )

    return response.data
  }

const buscarAdministradores =
  async (
    texto,
    rolId = null,
    limit = 10,
  ) => {
    const textoLimpio =
      texto?.trim() || ''

    if (
      textoLimpio.length < 2
    ) {
      return []
    }

    const params = {
      texto:
        textoLimpio,
      limit,
    }

    if (
      rolId !== null &&
      rolId !== ''
    ) {
      params.rolId =
        Number(rolId)
    }

    const response =
      await apiDotNet.get(
        '/api/admin/accounts/search',
        {
          params,
        },
      )

    return response.data
  }

const obtenerAdministradorPorId =
  async (id) => {
    const response =
      await apiDotNet.get(
        `/api/admin/accounts/${id}`,
      )

    return response.data
  }

const crearAdministrador =
  async ({
    nombre,
    correo,
    password,
    telefono,
    rolId,
  }) => {
    const response =
      await apiDotNet.post(
        '/api/admin/accounts',
        {
          nombre:
            nombre.trim(),

          correo:
            correo.trim(),

          password,

          telefono:
            telefono?.trim() ||
            null,

          rolId:
            Number(rolId),
        },
      )

    return response.data
  }

const actualizarAdministrador =
  async (
    id,
    {
      nombre,
      correo,
      telefono,
    },
  ) => {
    const response =
      await apiDotNet.put(
        `/api/admin/accounts/${id}`,
        {
          nombre:
            nombre.trim(),

          correo:
            correo.trim(),

          telefono:
            telefono?.trim() ??
            '',
        },
      )

    return response.data
  }

const cambiarEstado =
  async (
    id,
    estado,
  ) => {
    const response =
      await apiDotNet.patch(
        `/api/admin/accounts/${id}/status`,
        {
          estado:
            Number(estado),
        },
      )

    return response.data
  }

const eliminarAdministrador =
  async (id) => {
    const response =
      await apiDotNet.delete(
        `/api/admin/accounts/${id}`,
      )

    return response.data
  }

const adminAccountsService = {
  obtenerAdministradores,
  buscarAdministradores,
  obtenerAdministradorPorId,
  crearAdministrador,
  actualizarAdministrador,
  cambiarEstado,
  eliminarAdministrador,
}

export default adminAccountsService