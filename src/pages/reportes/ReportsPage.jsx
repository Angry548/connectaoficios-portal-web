import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import {
  FlagOutlined,
  PersonOffOutlined,
  ReportProblemOutlined,
  SearchOutlined,
  VisibilityOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material'

import adminReportsService from '../../services/adminReportsService'
import adminUsersService from '../../services/adminUsersService'
import adminServicesService from '../../services/adminServicesService'

const ESTADOS = {
  PENDIENTE: {
    texto: 'Pendiente',
    color: 'warning',
  },

  EN_REVISION: {
    texto: 'En revisión',
    color: 'info',
  },

  RESUELTO: {
    texto: 'Resuelto',
    color: 'success',
  },

  RECHAZADO: {
    texto: 'Rechazado',
    color: 'error',
  },
}

const ACCIONES = {
  NINGUNA: {
    texto:
      'Sin acción administrativa adicional',

    accionTomada:
      'Sin acción administrativa adicional.',
  },

  ADVERTIR_USUARIO: {
    texto:
      'Registrar advertencia al usuario',

    accionTomada:
      'Se registró una advertencia administrativa al usuario relacionado.',
  },

  SUSPENDER_USUARIO: {
    texto:
      'Suspender cuenta relacionada',

    accionTomada:
      'Se suspendió la cuenta del usuario relacionado.',
  },

  DESACTIVAR_SERVICIO: {
    texto:
      'Desactivar servicio relacionado',

    accionTomada:
      'Se desactivó el servicio relacionado.',
  },
}

const obtenerMensajeError = (
  error,
) => {
  if (!error?.response) {
    return (
      error?.message ||
      'No fue posible conectar con el servidor.'
    )
  }

  if (
    error.response.status ===
    401
  ) {
    return 'La sesión ha expirado. Inicie sesión nuevamente.'
  }

  if (
    error.response.status ===
    403
  ) {
    return 'No tiene permisos para realizar esta operación.'
  }

  return (
    error.response.data
      ?.mensaje ||
    error.response.data
      ?.message ||
    'Ocurrió un error al procesar la solicitud.'
  )
}

const obtenerEstado = (
  estado,
) => {
  return (
    ESTADOS[
      String(
        estado || '',
      ).toUpperCase()
    ] || {
      texto:
        estado ||
        'Sin estado',

      color: 'default',
    }
  )
}

const formatearFecha = (
  fecha,
) => {
  if (!fecha) {
    return 'No disponible'
  }

  const valor =
    new Date(fecha)

  if (
    Number.isNaN(
      valor.getTime(),
    )
  ) {
    return 'No disponible'
  }

  return new Intl.DateTimeFormat(
    'es-SV',
    {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(valor)
}

const obtenerId = (
  entidad,
) => {
  return (
    entidad?.id ??
    entidad?.Id ??
    null
  )
}

const obtenerNombre = (
  entidad,
) => {
  return (
    entidad?.nombre ??
    entidad?.Nombre ??
    ''
  )
}

function DatoDetalle({
  titulo,
  children,
}) {
  return (
    <Box>
      <Typography
        sx={{
          color: '#667085',
          fontSize: 12,
          fontWeight: 700,
          mb: 0.5,
        }}
      >
        {titulo}
      </Typography>

      <Box
        sx={{
          color: '#344054',
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default function ReportsPage() {
  const [
    reportes,
    setReportes,
  ] = useState([])

  const [
    cargando,
    setCargando,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const [
    mensaje,
    setMensaje,
  ] = useState('')

  const [
    texto,
    setTexto,
  ] = useState('')

  const [
    estado,
    setEstado,
  ] = useState('')

  const [
    tipo,
    setTipo,
  ] = useState('')

  const [
    reportanteTexto,
    setReportanteTexto,
  ] = useState('')

  const [
    reportanteSeleccionado,
    setReportanteSeleccionado,
  ] = useState(null)

  const [
    reportantesOpciones,
    setReportantesOpciones,
  ] = useState([])

  const [
    buscandoReportante,
    setBuscandoReportante,
  ] = useState(false)

  const [
    reportadoTexto,
    setReportadoTexto,
  ] = useState('')

  const [
    reportadoSeleccionado,
    setReportadoSeleccionado,
  ] = useState(null)

  const [
    reportadosOpciones,
    setReportadosOpciones,
  ] = useState([])

  const [
    buscandoReportado,
    setBuscandoReportado,
  ] = useState(false)

  const [
    servicioTexto,
    setServicioTexto,
  ] = useState('')

  const [
    servicioSeleccionado,
    setServicioSeleccionado,
  ] = useState(null)

  const [
    serviciosOpciones,
    setServiciosOpciones,
  ] = useState([])

  const [
    buscandoServicio,
    setBuscandoServicio,
  ] = useState(false)

  const [
    filtros,
    setFiltros,
  ] = useState({
    texto: '',
    estado: '',
    tipo: '',
    usuarioReportanteId:
      null,
    usuarioReportadoId:
      null,
    servicioId: null,
  })

  const [
    pagina,
    setPagina,
  ] = useState(0)

  const [
    tamanioPagina,
    setTamanioPagina,
  ] = useState(10)

  const [
    totalElementos,
    setTotalElementos,
  ] = useState(0)

  const [
    detalleAbierto,
    setDetalleAbierto,
  ] = useState(false)

  const [
    cargandoDetalle,
    setCargandoDetalle,
  ] = useState(false)

  const [
    reporteDetalle,
    setReporteDetalle,
  ] = useState(null)

  const [
    reportanteDetalle,
    setReportanteDetalle,
  ] = useState(null)

  const [
    usuarioRelacionadoDetalle,
    setUsuarioRelacionadoDetalle,
  ] = useState(null)

  const [
    servicioDetalle,
    setServicioDetalle,
  ] = useState(null)

  const [
    procesando,
    setProcesando,
  ] = useState(false)

  const [
    gestionAbierta,
    setGestionAbierta,
  ] = useState(false)

  const [
    tipoGestion,
    setTipoGestion,
  ] = useState('')

  const [
    resolucion,
    setResolucion,
  ] = useState('')

  const [
    accionSeleccionada,
    setAccionSeleccionada,
  ] = useState('NINGUNA')

  useEffect(() => {
    const buscar =
      reportanteTexto.trim()

    if (
      buscar.length < 2
    ) {
      setReportantesOpciones(
        [],
      )

      setBuscandoReportante(
        false,
      )

      return undefined
    }

    const timeout =
      window.setTimeout(
        async () => {
          setBuscandoReportante(
            true,
          )

          try {
            const respuesta =
              await adminUsersService
                .buscarUsuarios(
                  buscar,
                  null,
                  10,
                )

            setReportantesOpciones(
              Array.isArray(
                respuesta,
              )
                ? respuesta
                : [],
            )
          } catch {
            setReportantesOpciones(
              [],
            )
          } finally {
            setBuscandoReportante(
              false,
            )
          }
        },
        350,
      )

    return () =>
      window.clearTimeout(
        timeout,
      )
  }, [reportanteTexto])

  useEffect(() => {
    const buscar =
      reportadoTexto.trim()

    if (
      buscar.length < 2
    ) {
      setReportadosOpciones(
        [],
      )

      setBuscandoReportado(
        false,
      )

      return undefined
    }

    const timeout =
      window.setTimeout(
        async () => {
          setBuscandoReportado(
            true,
          )

          try {
            const respuesta =
              await adminUsersService
                .buscarUsuarios(
                  buscar,
                  null,
                  10,
                )

            setReportadosOpciones(
              Array.isArray(
                respuesta,
              )
                ? respuesta
                : [],
            )
          } catch {
            setReportadosOpciones(
              [],
            )
          } finally {
            setBuscandoReportado(
              false,
            )
          }
        },
        350,
      )

    return () =>
      window.clearTimeout(
        timeout,
      )
  }, [reportadoTexto])

  useEffect(() => {
    const buscar =
      servicioTexto.trim()

    if (
      buscar.length < 2
    ) {
      setServiciosOpciones(
        [],
      )

      setBuscandoServicio(
        false,
      )

      return undefined
    }

    const timeout =
      window.setTimeout(
        async () => {
          setBuscandoServicio(
            true,
          )

          try {
            const respuesta =
              await adminReportsService
                .buscarServicios(
                  buscar,
                  10,
                )

            setServiciosOpciones(
              Array.isArray(
                respuesta,
              )
                ? respuesta
                : [],
            )
          } catch {
            setServiciosOpciones(
              [],
            )
          } finally {
            setBuscandoServicio(
              false,
            )
          }
        },
        350,
      )

    return () =>
      window.clearTimeout(
        timeout,
      )
  }, [servicioTexto])

  const enriquecerReportes =
    useCallback(
      async (
        lista,
      ) => {
        const idsUsuarios =
          new Set()

        const idsServicios =
          new Set()

        lista.forEach(
          (reporte) => {
            if (
              reporte
                .usuarioReportanteId
            ) {
              idsUsuarios.add(
                Number(
                  reporte
                    .usuarioReportanteId,
                ),
              )
            }

            if (
              reporte
                .usuarioReportadoId
            ) {
              idsUsuarios.add(
                Number(
                  reporte
                    .usuarioReportadoId,
                ),
              )
            }

            if (
              reporte.servicioId
            ) {
              idsServicios.add(
                Number(
                  reporte
                    .servicioId,
                ),
              )
            }
          },
        )

        const mapaUsuarios =
          new Map()

        const mapaServicios =
          new Map()

        await Promise.allSettled(
          [
            ...idsUsuarios,
          ].map(
            async (id) => {
              try {
                const usuario =
                  await adminUsersService
                    .obtenerUsuarioPorId(
                      id,
                    )

                mapaUsuarios.set(
                  id,
                  usuario,
                )
              } catch {
                mapaUsuarios.set(
                  id,
                  null,
                )
              }
            },
          ),
        )

        await Promise.allSettled(
          [
            ...idsServicios,
          ].map(
            async (id) => {
              try {
                const servicio =
                  await adminServicesService
                    .obtenerServicioPorId(
                      id,
                    )

                mapaServicios.set(
                  id,
                  servicio,
                )
              } catch {
                mapaServicios.set(
                  id,
                  null,
                )
              }
            },
          ),
        )

        return lista.map(
          (reporte) => ({
            ...reporte,

            reportante:
              mapaUsuarios.get(
                Number(
                  reporte
                    .usuarioReportanteId,
                ),
              ) ||
              null,

            usuarioRelacionado:
              reporte
                .usuarioReportadoId
                ? mapaUsuarios.get(
                    Number(
                      reporte
                        .usuarioReportadoId,
                    ),
                  ) ||
                  null
                : null,

            servicioRelacionado:
              reporte.servicioId
                ? mapaServicios.get(
                    Number(
                      reporte
                        .servicioId,
                    ),
                  ) ||
                  null
                : null,
          }),
        )
      },
      [],
    )

  const cargarReportes =
    useCallback(
      async () => {
        setCargando(true)
        setError('')

        try {
          const respuesta =
            await adminReportsService
              .obtenerReportes({
                ...filtros,

                page: pagina,

                size:
                  tamanioPagina,
              })

          const enriquecidos =
            await enriquecerReportes(
              respuesta
                .contenido,
            )

          setReportes(
            enriquecidos,
          )

          setTotalElementos(
            respuesta
              .totalElementos,
          )
        } catch (err) {
          setReportes([])
          setTotalElementos(0)

          setError(
            obtenerMensajeError(
              err,
            ),
          )
        } finally {
          setCargando(false)
        }
      },
      [
        filtros,
        pagina,
        tamanioPagina,
        enriquecerReportes,
      ],
    )

  useEffect(() => {
    cargarReportes()
  }, [cargarReportes])

  const aplicarFiltros = (
    event,
  ) => {
    event.preventDefault()

    setPagina(0)

    setFiltros({
      texto:
        texto.trim(),

      estado,

      tipo,

      usuarioReportanteId:
        obtenerId(
          reportanteSeleccionado,
        ),

      usuarioReportadoId:
        obtenerId(
          reportadoSeleccionado,
        ),

      servicioId:
        obtenerId(
          servicioSeleccionado,
        ),
    })
  }

  const limpiarFiltros = () => {
    setTexto('')
    setEstado('')
    setTipo('')

    setReportanteTexto('')
    setReportanteSeleccionado(
      null,
    )
    setReportantesOpciones([])

    setReportadoTexto('')
    setReportadoSeleccionado(
      null,
    )
    setReportadosOpciones([])

    setServicioTexto('')
    setServicioSeleccionado(
      null,
    )
    setServiciosOpciones([])

    setPagina(0)

    setFiltros({
      texto: '',
      estado: '',
      tipo: '',
      usuarioReportanteId:
        null,
      usuarioReportadoId:
        null,
      servicioId: null,
    })
  }

  const abrirDetalle =
    async (reporte) => {
      setDetalleAbierto(true)
      setCargandoDetalle(true)

      setReporteDetalle(null)
      setReportanteDetalle(null)
      setUsuarioRelacionadoDetalle(
        null,
      )
      setServicioDetalle(null)

      try {
        const detalle =
          await adminReportsService
            .obtenerReportePorId(
              reporte.id,
            )

        setReporteDetalle(
          detalle,
        )

        const tareas = []

        if (
          detalle
            .usuarioReportanteId
        ) {
          tareas.push(
            adminUsersService
              .obtenerUsuarioPorId(
                detalle
                  .usuarioReportanteId,
              )
              .then(
                (usuario) => {
                  setReportanteDetalle(
                    usuario,
                  )
                },
              )
              .catch(() => {
                setReportanteDetalle(
                  null,
                )
              }),
          )
        }

        if (
          detalle
            .usuarioReportadoId
        ) {
          tareas.push(
            adminUsersService
              .obtenerUsuarioPorId(
                detalle
                  .usuarioReportadoId,
              )
              .then(
                (usuario) => {
                  setUsuarioRelacionadoDetalle(
                    usuario,
                  )
                },
              )
              .catch(() => {
                setUsuarioRelacionadoDetalle(
                  null,
                )
              }),
          )
        }

        if (
          detalle.servicioId
        ) {
          tareas.push(
            adminServicesService
              .obtenerServicioPorId(
                detalle
                  .servicioId,
              )
              .then(
                (servicio) => {
                  setServicioDetalle(
                    servicio,
                  )
                },
              )
              .catch(() => {
                setServicioDetalle(
                  null,
                )
              }),
          )
        }

        await Promise.allSettled(
          tareas,
        )
      } catch (err) {
        setDetalleAbierto(
          false,
        )

        setError(
          obtenerMensajeError(
            err,
          ),
        )
      } finally {
        setCargandoDetalle(
          false,
        )
      }
    }

  const cerrarDetalle = () => {
    if (
      cargandoDetalle ||
      procesando
    ) {
      return
    }

    setDetalleAbierto(false)
    setReporteDetalle(null)
    setReportanteDetalle(null)
    setUsuarioRelacionadoDetalle(
      null,
    )
    setServicioDetalle(null)
  }

  const iniciarRevision =
    async () => {
      if (
        !reporteDetalle
      ) {
        return
      }

      setProcesando(true)

      try {
        const actualizado =
          await adminReportsService
            .iniciarRevision(
              reporteDetalle.id,
            )

        setReporteDetalle(
          actualizado,
        )

        setMensaje(
          'El reporte se encuentra ahora en revisión.',
        )

        await cargarReportes()
      } catch (err) {
        setError(
          obtenerMensajeError(
            err,
          ),
        )
      } finally {
        setProcesando(false)
      }
    }

  const abrirGestion = (
    gestion,
  ) => {
    setTipoGestion(
      gestion,
    )

    setResolucion('')

    setAccionSeleccionada(
      'NINGUNA',
    )

    setGestionAbierta(
      true,
    )
  }

  const cerrarGestion = () => {
    if (procesando) {
      return
    }

    setGestionAbierta(false)
    setTipoGestion('')
    setResolucion('')
    setAccionSeleccionada(
      'NINGUNA',
    )
  }

  const usuarioObjetivoId =
    useMemo(() => {
      if (
        reporteDetalle
          ?.usuarioReportadoId
      ) {
        return Number(
          reporteDetalle
            .usuarioReportadoId,
        )
      }

      if (
        servicioDetalle
          ?.trabajadorId
      ) {
        return Number(
          servicioDetalle
            .trabajadorId,
        )
      }

      return null
    }, [
      reporteDetalle,
      servicioDetalle,
    ])

  const confirmarGestion =
    async () => {
      const textoResolucion =
        resolucion.trim()

      if (
        !textoResolucion
      ) {
        setError(
          'Debe escribir el comentario o resolución del reporte.',
        )
        return
      }

      if (
        textoResolucion.length >
        2000
      ) {
        setError(
          'La resolución no puede superar los 2000 caracteres.',
        )
        return
      }

      if (
        !reporteDetalle
      ) {
        return
      }

      setProcesando(true)
      setError('')

      try {
        if (
          tipoGestion ===
          'RECHAZAR'
        ) {
          const actualizado =
            await adminReportsService
              .rechazar(
                reporteDetalle.id,
                textoResolucion,
              )

          setReporteDetalle(
            actualizado,
          )

          setMensaje(
            'Reporte rechazado correctamente.',
          )

          cerrarGestion()

          await cargarReportes()

          return
        }

        const accion =
          ACCIONES[
            accionSeleccionada
          ]

        if (
          !accion
        ) {
          throw new Error(
            'La acción seleccionada no es válida.',
          )
        }

        if (
          accionSeleccionada ===
          'SUSPENDER_USUARIO'
        ) {
          if (
            !usuarioObjetivoId
          ) {
            throw new Error(
              'No fue posible identificar el usuario que debe suspenderse.',
            )
          }

          await adminUsersService
            .cambiarEstado(
              usuarioObjetivoId,
              2,
            )
        }

        if (
          accionSeleccionada ===
          'DESACTIVAR_SERVICIO'
        ) {
          if (
            !reporteDetalle
              .servicioId
          ) {
            throw new Error(
              'Este reporte no tiene un servicio relacionado.',
            )
          }

          await adminServicesService
            .cambiarEstado(
              reporteDetalle
                .servicioId,
              'INACTIVO',
            )
        }

        const actualizado =
          await adminReportsService
            .resolver(
              reporteDetalle.id,
              textoResolucion,
              accion
                .accionTomada,
            )

        setReporteDetalle(
          actualizado,
        )

        setMensaje(
          'Reporte resuelto correctamente.',
        )

        setGestionAbierta(
          false,
        )

        setTipoGestion('')
        setResolucion('')
        setAccionSeleccionada(
          'NINGUNA',
        )

        await cargarReportes()
      } catch (err) {
        setError(
          obtenerMensajeError(
            err,
          ),
        )
      } finally {
        setProcesando(false)
      }
    }

  const cambiarPagina = (
    event,
    nuevaPagina,
  ) => {
    setPagina(
      nuevaPagina,
    )
  }

  const cambiarTamanioPagina = (
    event,
  ) => {
    setTamanioPagina(
      Number(
        event.target.value,
      ),
    )

    setPagina(0)
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          justifyContent:
            'space-between',
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: 25,
                sm: 30,
              },
              fontWeight: 800,
              color: '#101828',
            }}
          >
            Gestión de reportes
          </Typography>

          <Typography
            sx={{
              color: '#667085',
              fontSize: 15,
              mt: 0.7,
            }}
          >
            Revisa y gestiona los reportes realizados por los usuarios.
          </Typography>
        </Box>

        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            backgroundColor:
              '#FFF4ED',
            color: '#E04F16',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
          }}
        >
          <FlagOutlined />
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border:
            '1px solid #EAECF0',
          borderRadius: 3,
          p: {
            xs: 2,
            sm: 3,
          },
          mb: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: '#101828',
            mb: 2.5,
          }}
        >
          Buscar y filtrar
        </Typography>

        <Box
          component="form"
          onSubmit={
            aplicarFiltros
          }
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                {
                  xs: '1fr',
                  md:
                    'repeat(2, minmax(0, 1fr))',
                  xl:
                    'repeat(3, minmax(0, 1fr))',
                },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Buscar"
              value={texto}
              onChange={(
                event,
              ) =>
                setTexto(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Motivo, descripción o resolución"
            />

            <FormControl
              fullWidth
            >
              <InputLabel>
                Estado
              </InputLabel>

              <Select
                value={estado}
                label="Estado"
                onChange={(
                  event,
                ) =>
                  setEstado(
                    event
                      .target
                      .value,
                  )
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>

                <MenuItem
                  value="PENDIENTE"
                >
                  Pendiente
                </MenuItem>

                <MenuItem
                  value="EN_REVISION"
                >
                  En revisión
                </MenuItem>

                <MenuItem
                  value="RESUELTO"
                >
                  Resuelto
                </MenuItem>

                <MenuItem
                  value="RECHAZADO"
                >
                  Rechazado
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              fullWidth
            >
              <InputLabel>
                Tipo
              </InputLabel>

              <Select
                value={tipo}
                label="Tipo"
                onChange={(
                  event,
                ) =>
                  setTipo(
                    event
                      .target
                      .value,
                  )
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>

                <MenuItem
                  value="USUARIO"
                >
                  Usuario
                </MenuItem>

                <MenuItem
                  value="SERVICIO"
                >
                  Servicio
                </MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              value={
                reportanteSeleccionado
              }
              options={
                reportantesOpciones
              }
              loading={
                buscandoReportante
              }
              inputValue={
                reportanteTexto
              }
              filterOptions={(
                options,
              ) => options}
              onInputChange={(
                event,
                value,
                reason,
              ) => {
                setReportanteTexto(
                  value,
                )

                if (
                  reason ===
                  'clear'
                ) {
                  setReportanteSeleccionado(
                    null,
                  )

                  setReportantesOpciones(
                    [],
                  )
                }
              }}
              onChange={(
                event,
                value,
              ) =>
                setReportanteSeleccionado(
                  value,
                )
              }
              getOptionLabel={(
                option,
              ) =>
                obtenerNombre(
                  option,
                )
              }
              isOptionEqualToValue={(
                option,
                value,
              ) =>
                obtenerId(
                  option,
                ) ===
                obtenerId(
                  value,
                )
              }
              noOptionsText={
                reportanteTexto
                  .trim()
                  .length < 2
                  ? 'Escriba al menos 2 caracteres'
                  : 'Sin coincidencias'
              }
              loadingText="Buscando..."
              renderInput={(
                params,
              ) => (
                <TextField
                  {...params}
                  label="Usuario reportante"
                  placeholder="Buscar por coincidencia"
                />
              )}
            />

            <Autocomplete
              value={
                reportadoSeleccionado
              }
              options={
                reportadosOpciones
              }
              loading={
                buscandoReportado
              }
              inputValue={
                reportadoTexto
              }
              filterOptions={(
                options,
              ) => options}
              onInputChange={(
                event,
                value,
                reason,
              ) => {
                setReportadoTexto(
                  value,
                )

                if (
                  reason ===
                  'clear'
                ) {
                  setReportadoSeleccionado(
                    null,
                  )

                  setReportadosOpciones(
                    [],
                  )
                }
              }}
              onChange={(
                event,
                value,
              ) =>
                setReportadoSeleccionado(
                  value,
                )
              }
              getOptionLabel={(
                option,
              ) =>
                obtenerNombre(
                  option,
                )
              }
              isOptionEqualToValue={(
                option,
                value,
              ) =>
                obtenerId(
                  option,
                ) ===
                obtenerId(
                  value,
                )
              }
              noOptionsText={
                reportadoTexto
                  .trim()
                  .length < 2
                  ? 'Escriba al menos 2 caracteres'
                  : 'Sin coincidencias'
              }
              loadingText="Buscando..."
              renderInput={(
                params,
              ) => (
                <TextField
                  {...params}
                  label="Usuario reportado"
                  placeholder="Buscar por coincidencia"
                />
              )}
            />

            <Autocomplete
              value={
                servicioSeleccionado
              }
              options={
                serviciosOpciones
              }
              loading={
                buscandoServicio
              }
              inputValue={
                servicioTexto
              }
              filterOptions={(
                options,
              ) => options}
              onInputChange={(
                event,
                value,
                reason,
              ) => {
                setServicioTexto(
                  value,
                )

                if (
                  reason ===
                  'clear'
                ) {
                  setServicioSeleccionado(
                    null,
                  )

                  setServiciosOpciones(
                    [],
                  )
                }
              }}
              onChange={(
                event,
                value,
              ) =>
                setServicioSeleccionado(
                  value,
                )
              }
              getOptionLabel={(
                option,
              ) =>
                option?.titulo ||
                ''
              }
              isOptionEqualToValue={(
                option,
                value,
              ) =>
                obtenerId(
                  option,
                ) ===
                obtenerId(
                  value,
                )
              }
              noOptionsText={
                servicioTexto
                  .trim()
                  .length < 2
                  ? 'Escriba al menos 2 caracteres'
                  : 'Sin coincidencias'
              }
              loadingText="Buscando..."
              renderInput={(
                params,
              ) => (
                <TextField
                  {...params}
                  label="Servicio relacionado"
                  placeholder="Buscar por coincidencia"
                />
              )}
            />
          </Box>

          <Box
            sx={{
              mt: 2.5,
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              gap: 1.5,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={cargando}
              sx={{
                minWidth: 150,
                minHeight: 44,
                borderRadius: 2,
                textTransform:
                  'none',
                fontWeight: 700,
                backgroundColor:
                  '#0D9488',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor:
                    '#0F766E',
                  boxShadow:
                    'none',
                },
              }}
            >
              Aplicar filtros
            </Button>

            <Button
              variant="outlined"
              onClick={
                limpiarFiltros
              }
              disabled={cargando}
              sx={{
                minWidth: 120,
                minHeight: 44,
                borderRadius: 2,
                textTransform:
                  'none',
                fontWeight: 700,
                borderColor:
                  '#D0D5DD',
                color:
                  '#475467',
              }}
            >
              Limpiar
            </Button>

            <Button
              type="button"
              onClick={
                cargarReportes
              }
              disabled={cargando}
              sx={{
                minHeight: 44,
                textTransform:
                  'none',
                fontWeight: 700,
                color:
                  '#0D9488',
              }}
            >
              Actualizar
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError('')
          }
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          border:
            '1px solid #EAECF0',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2,
              sm: 3,
            },
            py: 2.5,
            borderBottom:
              '1px solid #EAECF0',
          }}
        >
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 700,
              color: '#101828',
            }}
          >
            Reportes registrados
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: '#667085',
              mt: 0.4,
            }}
          >
            {totalElementos}{' '}
            {totalElementos === 1
              ? 'reporte encontrado'
              : 'reportes encontrados'}
          </Typography>
        </Box>

        {cargando ? (
          <Box
            sx={{
              minHeight: 320,
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : reportes.length ===
          0 ? (
          <Box
            sx={{
              minHeight: 300,
              display: 'flex',
              flexDirection:
                'column',
              alignItems:
                'center',
              justifyContent:
                'center',
              textAlign:
                'center',
              p: 4,
            }}
          >
            <ReportProblemOutlined
              sx={{
                fontSize: 50,
                color: '#98A2B3',
                mb: 1.5,
              }}
            />

            <Typography
              sx={{
                color: '#344054',
                fontWeight: 700,
                fontSize: 17,
              }}
            >
              No se encontraron reportes
            </Typography>

            <Typography
              sx={{
                color: '#667085',
                fontSize: 14,
                mt: 0.5,
              }}
            >
              Cambie los filtros e intente nuevamente.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth: 1350,
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor:
                        '#F9FAFB',
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      Reportante
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      Relacionado
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      Motivo
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      Descripción
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      Fecha
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      Estado
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        width: 150,
                        fontWeight:
                          700,
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {reportes.map(
                    (reporte) => {
                      const estadoActual =
                        obtenerEstado(
                          reporte
                            .estado,
                        )

                      return (
                        <TableRow
                          key={
                            reporte.id
                          }
                          hover
                        >
                          <TableCell>
                            <Typography
                              sx={{
                                color:
                                  '#101828',
                                fontSize:
                                  14,
                                fontWeight:
                                  700,
                              }}
                            >
                              {reporte
                                .reportante
                                ?.nombre ||
                                `Usuario #${reporte.usuarioReportanteId}`}
                            </Typography>

                            <Typography
                              sx={{
                                color:
                                  '#667085',
                                fontSize:
                                  12,
                                mt: 0.2,
                              }}
                            >
                              {reporte
                                .reportante
                                ?.correo ||
                                ''}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={
                                reporte.tipo ===
                                'SERVICIO'
                                  ? 'Servicio'
                                  : 'Usuario'
                              }
                              sx={{
                                mb: 0.7,
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize:
                                  13,
                                fontWeight:
                                  600,
                                color:
                                  '#344054',
                                maxWidth:
                                  220,
                              }}
                            >
                              {reporte.tipo ===
                              'SERVICIO'
                                ? reporte
                                    .servicioRelacionado
                                    ?.titulo ||
                                  `Servicio #${reporte.servicioId}`
                                : reporte
                                    .usuarioRelacionado
                                    ?.nombre ||
                                  `Usuario #${reporte.usuarioReportadoId}`}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              sx={{
                                maxWidth:
                                  220,
                                fontSize:
                                  13,
                                fontWeight:
                                  700,
                                color:
                                  '#344054',
                              }}
                            >
                              {
                                reporte.motivo
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              sx={{
                                maxWidth:
                                  300,
                                fontSize:
                                  13,
                                color:
                                  '#667085',
                                display:
                                  '-webkit-box',
                                WebkitLineClamp:
                                  2,
                                WebkitBoxOrient:
                                  'vertical',
                                overflow:
                                  'hidden',
                              }}
                            >
                              {
                                reporte.descripcion
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              sx={{
                                fontSize:
                                  12,
                                color:
                                  '#475467',
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {formatearFecha(
                                reporte
                                  .fechaCreacion,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={
                                estadoActual
                                  .texto
                              }
                              color={
                                estadoActual
                                  .color
                              }
                              size="small"
                              sx={{
                                fontWeight:
                                  700,
                              }}
                            />
                          </TableCell>

                          <TableCell
                            align="center"
                          >
                            <Button
                              size="small"
                              startIcon={
                                <VisibilityOutlined />
                              }
                              onClick={() =>
                                abrirDetalle(
                                  reporte,
                                )
                              }
                              sx={{
                                textTransform:
                                  'none',
                                fontWeight:
                                  700,
                                color:
                                  '#0D9488',
                              }}
                            >
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    },
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={
                totalElementos
              }
              page={pagina}
              rowsPerPage={
                tamanioPagina
              }
              onPageChange={
                cambiarPagina
              }
              onRowsPerPageChange={
                cambiarTamanioPagina
              }
              rowsPerPageOptions={[
                5,
                10,
                20,
                50,
              ]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({
                from,
                to,
                count,
              }) =>
                `${from}-${to} de ${count}`
              }
            />
          </>
        )}
      </Paper>

      <Dialog
        open={
          detalleAbierto
        }
        onClose={
          cerrarDetalle
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: '#101828',
          }}
        >
          Detalle del reporte
        </DialogTitle>

        <DialogContent
          dividers
        >
          {cargandoDetalle ? (
            <Box
              sx={{
                minHeight: 350,
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            reporteDetalle && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection:
                    'column',
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: {
                      xs: 'flex-start',
                      sm: 'center',
                    },
                    flexDirection: {
                      xs: 'column',
                      sm: 'row',
                    },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color:
                          '#667085',
                        fontSize:
                          12,
                        fontWeight:
                          700,
                      }}
                    >
                      Reporte #
                      {
                        reporteDetalle.id
                      }
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#101828',
                        fontSize:
                          21,
                        fontWeight:
                          800,
                        mt: 0.5,
                      }}
                    >
                      {
                        reporteDetalle.motivo
                      }
                    </Typography>
                  </Box>

                  <Chip
                    label={
                      obtenerEstado(
                        reporteDetalle
                          .estado,
                      ).texto
                    }
                    color={
                      obtenerEstado(
                        reporteDetalle
                          .estado,
                      ).color
                    }
                    sx={{
                      fontWeight:
                        700,
                    }}
                  />
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      {
                        xs: '1fr',
                        sm:
                          'repeat(2, minmax(0, 1fr))',
                      },
                    gap: 3,
                  }}
                >
                  <DatoDetalle
                    titulo="Usuario reportante"
                  >
                    <Typography
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      {reportanteDetalle
                        ?.nombre ||
                        `Usuario #${reporteDetalle.usuarioReportanteId}`}
                    </Typography>

                    {reportanteDetalle
                      ?.correo && (
                      <Typography
                        sx={{
                          fontSize:
                            12,
                          color:
                            '#667085',
                        }}
                      >
                        {
                          reportanteDetalle
                            .correo
                        }
                      </Typography>
                    )}
                  </DatoDetalle>

                  <DatoDetalle
                    titulo="Tipo de reporte"
                  >
                    <Chip
                      label={
                        reporteDetalle
                          .tipo ===
                        'SERVICIO'
                          ? 'Servicio'
                          : 'Usuario'
                      }
                      size="small"
                      variant="outlined"
                    />
                  </DatoDetalle>
                </Box>

                <Divider />

                {reporteDetalle.tipo ===
                'USUARIO' ? (
                  <Box>
                    <Typography
                      sx={{
                        color:
                          '#101828',
                        fontSize:
                          16,
                        fontWeight:
                          800,
                        mb: 2,
                      }}
                    >
                      Usuario reportado
                    </Typography>

                    <Box
                      sx={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          {
                            xs:
                              '1fr',
                            sm:
                              'repeat(2, minmax(0, 1fr))',
                          },
                        gap: 2,
                      }}
                    >
                      <DatoDetalle
                        titulo="Nombre"
                      >
                        {usuarioRelacionadoDetalle
                          ?.nombre ||
                          `Usuario #${reporteDetalle.usuarioReportadoId}`}
                      </DatoDetalle>

                      <DatoDetalle
                        titulo="Correo"
                      >
                        {usuarioRelacionadoDetalle
                          ?.correo ||
                          'No disponible'}
                      </DatoDetalle>

                      <DatoDetalle
                        titulo="Rol"
                      >
                        {usuarioRelacionadoDetalle
                          ?.rol ||
                          'No disponible'}
                      </DatoDetalle>

                      <DatoDetalle
                        titulo="Estado"
                      >
                        {usuarioRelacionadoDetalle
                          ?.estado ||
                          'No disponible'}
                      </DatoDetalle>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography
                      sx={{
                        color:
                          '#101828',
                        fontSize:
                          16,
                        fontWeight:
                          800,
                        mb: 2,
                      }}
                    >
                      Servicio reportado
                    </Typography>

                    <Box
                      sx={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          {
                            xs:
                              '1fr',
                            sm:
                              'repeat(2, minmax(0, 1fr))',
                          },
                        gap: 2,
                      }}
                    >
                      <DatoDetalle
                        titulo="Servicio"
                      >
                        {servicioDetalle
                          ?.titulo ||
                          `Servicio #${reporteDetalle.servicioId}`}
                      </DatoDetalle>

                      <DatoDetalle
                        titulo="Estado"
                      >
                        {servicioDetalle
                          ?.estado ||
                          'No disponible'}
                      </DatoDetalle>

                      <DatoDetalle
                        titulo="Categoría"
                      >
                        {servicioDetalle
                          ?.categoriaNombre ||
                          (
                            servicioDetalle
                              ?.categoriaId
                              ? `Categoría #${servicioDetalle.categoriaId}`
                              : 'No disponible'
                          )}
                      </DatoDetalle>

                      <DatoDetalle
                        titulo="Trabajador"
                      >
                        {servicioDetalle
                          ?.trabajadorNombre ||
                          (
                            servicioDetalle
                              ?.trabajadorId
                              ? `Usuario #${servicioDetalle.trabajadorId}`
                              : 'No disponible'
                          )}
                      </DatoDetalle>
                    </Box>
                  </Box>
                )}

                <Divider />

                <DatoDetalle
                  titulo="Descripción proporcionada por el usuario"
                >
                  <Typography
                    sx={{
                      whiteSpace:
                        'pre-wrap',
                      lineHeight:
                        1.8,
                    }}
                  >
                    {
                      reporteDetalle.descripcion
                    }
                  </Typography>
                </DatoDetalle>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      {
                        xs: '1fr',
                        sm:
                          'repeat(2, minmax(0, 1fr))',
                      },
                    gap: 2,
                  }}
                >
                  <DatoDetalle
                    titulo="Fecha del reporte"
                  >
                    {formatearFecha(
                      reporteDetalle
                        .fechaCreacion,
                    )}
                  </DatoDetalle>

                  <DatoDetalle
                    titulo="Fecha de resolución"
                  >
                    {formatearFecha(
                      reporteDetalle
                        .fechaResolucion,
                    )}
                  </DatoDetalle>
                </Box>

                {reporteDetalle
                  .resolucion && (
                  <>
                    <Divider />

                    <Box
                      sx={{
                        backgroundColor:
                          '#F9FAFB',
                        border:
                          '1px solid #EAECF0',
                        borderRadius:
                          2.5,
                        p: 2.5,
                      }}
                    >
                      <DatoDetalle
                        titulo="Comentario / resolución administrativa"
                      >
                        <Typography
                          sx={{
                            whiteSpace:
                              'pre-wrap',
                            lineHeight:
                              1.8,
                          }}
                        >
                          {
                            reporteDetalle.resolucion
                          }
                        </Typography>
                      </DatoDetalle>

                      {reporteDetalle
                        .accionTomada && (
                        <Box
                          sx={{
                            mt: 2,
                          }}
                        >
                          <DatoDetalle
                            titulo="Acción tomada"
                          >
                            {
                              reporteDetalle.accionTomada
                            }
                          </DatoDetalle>
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            )
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          {reporteDetalle
            ?.estado ===
            'PENDIENTE' && (
            <Button
              variant="contained"
              onClick={
                iniciarRevision
              }
              disabled={
                procesando
              }
              startIcon={
                procesando
                  ? null
                  : <SearchOutlined />
              }
              sx={{
                backgroundColor:
                  '#0D9488',
                boxShadow:
                  'none',
                textTransform:
                  'none',
                fontWeight:
                  700,
              }}
            >
              {procesando ? (
                <CircularProgress
                  size={20}
                  sx={{
                    color:
                      '#FFFFFF',
                  }}
                />
              ) : (
                'Iniciar revisión'
              )}
            </Button>
          )}

          {reporteDetalle
            ?.estado ===
            'EN_REVISION' && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() =>
                  abrirGestion(
                    'RECHAZAR',
                  )
                }
                disabled={
                  procesando
                }
                sx={{
                  textTransform:
                    'none',
                  fontWeight:
                    700,
                }}
              >
                Rechazar
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  abrirGestion(
                    'RESOLVER',
                  )
                }
                disabled={
                  procesando
                }
                sx={{
                  textTransform:
                    'none',
                  fontWeight:
                    700,
                  boxShadow:
                    'none',
                }}
              >
                Resolver
              </Button>
            </>
          )}

          <Button
            onClick={
              cerrarDetalle
            }
            disabled={
              procesando
            }
            sx={{
              textTransform:
                'none',
              fontWeight: 700,
              color:
                '#475467',
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={
          gestionAbierta
        }
        onClose={
          cerrarGestion
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: '#101828',
          }}
        >
          {tipoGestion ===
          'RESOLVER'
            ? 'Resolver reporte'
            : 'Rechazar reporte'}
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection:
                'column',
              gap: 2.5,
            }}
          >
            <Alert
              severity={
                tipoGestion ===
                'RESOLVER'
                  ? 'info'
                  : 'warning'
              }
            >
              {tipoGestion ===
              'RESOLVER'
                ? 'Registre el comentario final y la acción administrativa aplicada.'
                : 'Indique por qué el reporte será rechazado.'}
            </Alert>

            <TextField
              fullWidth
              multiline
              minRows={5}
              maxRows={10}
              label={
                tipoGestion ===
                'RESOLVER'
                  ? 'Comentario / resolución'
                  : 'Motivo del rechazo'
              }
              value={
                resolucion
              }
              onChange={(
                event,
              ) =>
                setResolucion(
                  event
                    .target
                    .value,
                )
              }
              inputProps={{
                maxLength:
                  2000,
              }}
              helperText={`${resolucion.length}/2000`}
              disabled={
                procesando
              }
            />

            {tipoGestion ===
              'RESOLVER' && (
              <FormControl
                fullWidth
              >
                <InputLabel>
                  Acción administrativa
                </InputLabel>

                <Select
                  value={
                    accionSeleccionada
                  }
                  label="Acción administrativa"
                  onChange={(
                    event,
                  ) =>
                    setAccionSeleccionada(
                      event
                        .target
                        .value,
                    )
                  }
                  disabled={
                    procesando
                  }
                >
                  <MenuItem
                    value="NINGUNA"
                  >
                    Sin acción adicional
                  </MenuItem>

                  <MenuItem
                    value="ADVERTIR_USUARIO"
                  >
                    Registrar advertencia
                  </MenuItem>

                  <MenuItem
                    value="SUSPENDER_USUARIO"
                  >
                    Suspender cuenta
                  </MenuItem>

                  <MenuItem
                    value="DESACTIVAR_SERVICIO"
                    disabled={
                      !reporteDetalle
                        ?.servicioId
                    }
                  >
                    Desactivar servicio
                  </MenuItem>
                </Select>
              </FormControl>
            )}

            {tipoGestion ===
              'RESOLVER' &&
              accionSeleccionada ===
                'SUSPENDER_USUARIO' && (
                <Alert
                  severity="warning"
                  icon={
                    <PersonOffOutlined />
                  }
                >
                  La cuenta relacionada será cambiada a estado Inactivo.
                </Alert>
              )}

            {tipoGestion ===
              'RESOLVER' &&
              accionSeleccionada ===
                'DESACTIVAR_SERVICIO' && (
                <Alert
                  severity="warning"
                  icon={
                    <WarningAmberOutlined />
                  }
                >
                  El servicio relacionado será desactivado y dejará de estar disponible para los clientes.
                </Alert>
              )}

            {tipoGestion ===
              'RESOLVER' &&
              accionSeleccionada ===
                'ADVERTIR_USUARIO' && (
                <Alert
                  severity="info"
                >
                  La advertencia quedará registrada como parte de la resolución administrativa.
                </Alert>
              )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={
              cerrarGestion
            }
            disabled={
              procesando
            }
            sx={{
              textTransform:
                'none',
              fontWeight:
                700,
              color:
                '#475467',
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color={
              tipoGestion ===
              'RESOLVER'
                ? 'success'
                : 'error'
            }
            onClick={
              confirmarGestion
            }
            disabled={
              procesando
            }
            sx={{
              minWidth: 130,
              minHeight: 42,
              textTransform:
                'none',
              fontWeight:
                700,
              boxShadow:
                'none',
            }}
          >
            {procesando ? (
              <CircularProgress
                size={20}
                sx={{
                  color:
                    '#FFFFFF',
                }}
              />
            ) : tipoGestion ===
              'RESOLVER' ? (
              'Resolver reporte'
            ) : (
              'Rechazar reporte'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={
          Boolean(mensaje)
        }
        autoHideDuration={
          4000
        }
        onClose={() =>
          setMensaje('')
        }
        anchorOrigin={{
          vertical:
            'bottom',
          horizontal:
            'right',
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() =>
            setMensaje('')
          }
        >
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  )
}