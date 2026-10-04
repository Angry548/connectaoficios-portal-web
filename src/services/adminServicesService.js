import apiJava from './apiJava'

const normalizarPagina = (
  data,
  paginaSolicitada = 0,
  tamanioSolicitado = 10,
) => {
  const contenido =
    data?.contenido ??
    data?.content ??
    data?.items ??
    []

  const pagina =
    data?.pagina ??
    data?.page ??
    data?.number ??
    paginaSolicitada

  const tamanio =
    data?.tamanio ??
    data?.size ??
    data?.pageSize ??
    tamanioSolicitado

  const totalElementos =
    data?.totalElementos ??
    data?.totalElements ??
    data?.totalItems ??
    contenido.length

  const totalPaginas =
    data?.totalPaginas ??
    data?.totalPages ??
    (
      totalElementos > 0
        ? Math.ceil(
            totalElementos /
              Math.max(
                Number(tamanio) ||
                  tamanioSolicitado,
                1,
              ),
          )
        : 0
    )

  return {
    contenido:
      Array.isArray(
        contenido,
      )
        ? contenido
        : [],

    pagina:
      Number(pagina) ||
      0,

    tamanio:
      Number(tamanio) ||
      tamanioSolicitado,

    totalElementos:
      Number(
        totalElementos,
      ) || 0,

    totalPaginas:
      Number(
        totalPaginas,
      ) || 0,
  }
}

const obtenerServicios = async ({
  texto = '',
  trabajadorId = null,
  categoriaId = null,
  estado = '',
  page = 0,
  size = 10,
} = {}) => {
  const params = {
    page,
    size,
  }

  const textoLimpio =
    texto?.trim() || ''

  if (textoLimpio) {
    params.texto =
      textoLimpio
  }

  if (
    trabajadorId !== null &&
    trabajadorId !== undefined &&
    trabajadorId !== ''
  ) {
    params.trabajadorId =
      Number(trabajadorId)
  }

  if (
    categoriaId !== null &&
    categoriaId !== undefined &&
    categoriaId !== ''
  ) {
    params.categoriaId =
      Number(categoriaId)
  }

  if (estado) {
    params.estado =
      estado
  }

  const response =
    await apiJava.get(
      '/api/admin/servicios',
      {
        params,
      },
    )

  return normalizarPagina(
    response.data,
    page,
    size,
  )
}

const obtenerServicioPorId =
  async (id) => {
    if (
      id === null ||
      id === undefined ||
      id === ''
    ) {
      return null
    }

    try {
      const response =
        await apiJava.get(
          `/api/admin/servicios/${id}`,
        )

      return response.data
    } catch (error) {
      if (
        error.response?.status ===
        404
      ) {
        return null
      }

      throw error
    }
  }

const buscarCategorias = async (
  texto,
  limit = 10,
) => {
  const textoLimpio =
    texto?.trim() || ''

  if (
    textoLimpio.length < 2
  ) {
    return []
  }

  const limiteSeguro =
    Math.min(
      Math.max(
        Number(limit) || 10,
        1,
      ),
      10,
    )

  const response =
    await apiJava.get(
      '/api/categorias/buscar',
      {
        params: {
          texto:
            textoLimpio,

          limit:
            limiteSeguro,
        },
      },
    )

  return Array.isArray(
    response.data,
  )
    ? response.data
    : []
}

const cambiarEstado = async (
  id,
  estado,
) => {
  const response =
    await apiJava.patch(
      `/api/admin/servicios/${id}/estado`,
      {
        estado,
      },
    )

  return response.data
}

const adminServicesService = {
  obtenerServicios,
  obtenerServicioPorId,
  buscarCategorias,
  cambiarEstado,
}

export default adminServicesService