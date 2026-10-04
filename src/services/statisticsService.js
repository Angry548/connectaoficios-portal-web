import apiDotNet from './apiDotNet'
import apiJava from './apiJava'

const normalizarNumero = (
  valor,
) => {
  const numero =
    Number(valor)

  return Number.isFinite(
    numero,
  )
    ? numero
    : 0
}

const construirFechaDesde = (
  fecha,
) => {
  if (!fecha) {
    return null
  }

  return `${fecha}T00:00:00`
}

const construirFechaHasta = (
  fecha,
) => {
  if (!fecha) {
    return null
  }

  return `${fecha}T23:59:59`
}

const obtenerEstadisticasUsuarios =
  async ({
    fechaDesde = '',
    fechaHasta = '',
  } = {}) => {
    const params = {}

    if (fechaDesde) {
      params.fechaDesde =
        construirFechaDesde(
          fechaDesde,
        )
    }

    if (fechaHasta) {
      params.fechaHasta =
        construirFechaHasta(
          fechaHasta,
        )
    }

    const response =
      await apiDotNet.get(
        '/api/admin/statistics/users',
        {
          params,
        },
      )

    return {
      totalUsuarios:
        normalizarNumero(
          response.data
            ?.totalUsuarios,
        ),

      totalClientes:
        normalizarNumero(
          response.data
            ?.totalClientes,
        ),

      totalTrabajadores:
        normalizarNumero(
          response.data
            ?.totalTrabajadores,
        ),
    }
  }

const obtenerEstadisticasActividad =
  async ({
    fechaDesde = '',
    fechaHasta = '',
  } = {}) => {
    const params = {}

    if (fechaDesde) {
      params.fechaDesde =
        construirFechaDesde(
          fechaDesde,
        )
    }

    if (fechaHasta) {
      params.fechaHasta =
        construirFechaHasta(
          fechaHasta,
        )
    }

    const response =
      await apiJava.get(
        '/api/admin/estadisticas',
        {
          params,
        },
      )

    return {
      totalServicios:
        normalizarNumero(
          response.data
            ?.totalServicios,
        ),

      totalSolicitudes:
        normalizarNumero(
          response.data
            ?.totalSolicitudes,
        ),

      totalSolicitudesCompletadas:
        normalizarNumero(
          response.data
            ?.totalSolicitudesCompletadas,
        ),

      totalReportes:
        normalizarNumero(
          response.data
            ?.totalReportes,
        ),

      solicitudesPendientes:
        normalizarNumero(
          response.data
            ?.solicitudesPendientes,
        ),

      solicitudesAceptadas:
        normalizarNumero(
          response.data
            ?.solicitudesAceptadas,
        ),

      solicitudesEnProceso:
        normalizarNumero(
          response.data
            ?.solicitudesEnProceso,
        ),

      solicitudesRechazadas:
        normalizarNumero(
          response.data
            ?.solicitudesRechazadas,
        ),

      solicitudesCanceladas:
        normalizarNumero(
          response.data
            ?.solicitudesCanceladas,
        ),

      reportesPendientes:
        normalizarNumero(
          response.data
            ?.reportesPendientes,
        ),

      reportesEnRevision:
        normalizarNumero(
          response.data
            ?.reportesEnRevision,
        ),

      reportesResueltos:
        normalizarNumero(
          response.data
            ?.reportesResueltos,
        ),

      reportesRechazados:
        normalizarNumero(
          response.data
            ?.reportesRechazados,
        ),
    }
  }

const obtenerEstadisticas =
  async ({
    fechaDesde = '',
    fechaHasta = '',
  } = {}) => {
    const [
      usuarios,
      actividad,
    ] = await Promise.all([
      obtenerEstadisticasUsuarios({
        fechaDesde,
        fechaHasta,
      }),

      obtenerEstadisticasActividad({
        fechaDesde,
        fechaHasta,
      }),
    ])

    return {
      ...usuarios,
      ...actividad,
    }
  }

const statisticsService = {
  obtenerEstadisticas,
  obtenerEstadisticasUsuarios,
  obtenerEstadisticasActividad,
}

export default statisticsService