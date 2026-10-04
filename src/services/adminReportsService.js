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
            Number(totalElementos) /
              Number(tamanio),
          )
        : 0
    )

  return {
    contenido:
      Array.isArray(contenido)
        ? contenido
        : [],

    pagina:
      Number(pagina) || 0,

    tamanio:
      Number(tamanio) ||
      tamanioSolicitado,

    totalElementos:
      Number(totalElementos) || 0,

    totalPaginas:
      Number(totalPaginas) || 0,
  }
}

const obtenerReportes = async ({
  texto = '',
  estado = '',
  tipo = '',
  usuarioReportanteId = null,
  usuarioReportadoId = null,
  servicioId = null,
  administradorId = null,
  fechaDesde = '',
  fechaHasta = '',
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
    params.texto = textoLimpio
  }

  if (estado) {
    params.estado = estado
  }

  if (tipo) {
    params.tipo = tipo
  }

  if (usuarioReportanteId) {
    params.usuarioReportanteId =
      Number(usuarioReportanteId)
  }

  if (usuarioReportadoId) {
    params.usuarioReportadoId =
      Number(usuarioReportadoId)
  }

  if (servicioId) {
    params.servicioId =
      Number(servicioId)
  }

  if (administradorId) {
    params.administradorId =
      Number(administradorId)
  }

  if (fechaDesde) {
    params.fechaDesde = fechaDesde
  }

  if (fechaHasta) {
    params.fechaHasta = fechaHasta
  }

  const response =
    await apiJava.get(
      '/api/reportes/admin',
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

const obtenerReportePorId =
  async (id) => {
    const reporteId =
      Number(id)

    if (
      !Number.isInteger(reporteId) ||
      reporteId <= 0
    ) {
      throw new Error(
        'El identificador del reporte no es válido.',
      )
    }

    const response =
      await apiJava.get(
        `/api/reportes/admin/${reporteId}`,
      )

    return response.data
  }

const iniciarRevision =
  async (id) => {
    const response =
      await apiJava.put(
        `/api/reportes/admin/${id}/iniciar-revision`,
      )

    return response.data
  }

const resolver = async (
  id,
  resolucion,
  accionTomada,
) => {
  const response =
    await apiJava.put(
      `/api/reportes/admin/${id}/resolver`,
      {
        resolucion:
          resolucion.trim(),

        accionTomada:
          accionTomada.trim(),
      },
    )

  return response.data
}

const rechazar = async (
  id,
  resolucion,
) => {
  const response =
    await apiJava.put(
      `/api/reportes/admin/${id}/rechazar`,
      {
        resolucion:
          resolucion.trim(),
      },
    )

  return response.data
}

const buscarServicios = async (
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
      '/api/admin/servicios',
      {
        params: {
          texto:
            textoLimpio,

          page: 0,

          size:
            limiteSeguro,
        },
      },
    )

  const pagina =
    normalizarPagina(
      response.data,
      0,
      limiteSeguro,
    )

  return pagina.contenido
}

const adminReportsService = {
  obtenerReportes,
  obtenerReportePorId,
  iniciarRevision,
  resolver,
  rechazar,
  buscarServicios,
}

export default adminReportsService