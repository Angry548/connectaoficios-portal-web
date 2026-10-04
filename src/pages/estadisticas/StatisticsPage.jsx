import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'

import {
  AssessmentOutlined,
  AssignmentTurnedInOutlined,
  BarChartOutlined,
  FlagOutlined,
  GroupsOutlined,
  HandymanOutlined,
  PersonOutlineOutlined,
  RefreshOutlined,
  SearchOffOutlined,
  WorkOutlineOutlined,
} from '@mui/icons-material'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import statisticsService from '../../services/statisticsService'

const COLORES = [
  '#0D9488',
  '#2563EB',
  '#F59E0B',
  '#8B5CF6',
  '#DC2626',
  '#16A34A',
]

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
    return 'No tiene permisos para consultar las estadísticas.'
  }

  if (
    error.response.status ===
    404
  ) {
    return 'No fue posible encontrar el recurso solicitado.'
  }

  return (
    error.response.data
      ?.message ||
    error.response.data
      ?.mensaje ||
    'No fue posible cargar las estadísticas.'
  )
}

const formatearFechaTexto = (
  fecha,
) => {
  if (!fecha) {
    return ''
  }

  const [
    anio,
    mes,
    dia,
  ] = fecha.split('-')

  return `${dia}/${mes}/${anio}`
}

function TarjetaIndicador({
  titulo,
  valor,
  descripcion,
  icono,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border:
          '1px solid #EAECF0',
        borderRadius: 3,
        p: 2.5,
        minHeight: 155,
        display: 'flex',
        flexDirection:
          'column',
        justifyContent:
          'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems:
            'flex-start',
          justifyContent:
            'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              color:
                '#667085',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {titulo}
          </Typography>

          <Typography
            sx={{
              color:
                '#101828',
              fontSize: 32,
              lineHeight: 1,
              fontWeight: 800,
              mt: 1.4,
            }}
          >
            {valor}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.5,
            backgroundColor:
              '#F0FDFA',
            color:
              '#0D9488',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            flexShrink: 0,
          }}
        >
          {icono}
        </Box>
      </Box>

      <Typography
        sx={{
          color:
            '#98A2B3',
          fontSize: 12,
          mt: 2,
        }}
      >
        {descripcion}
      </Typography>
    </Paper>
  )
}

export default function StatisticsPage() {
  const hoy =
    new Date()
      .toISOString()
      .split('T')[0]

  const [
    fechaDesde,
    setFechaDesde,
  ] = useState('')

  const [
    fechaHasta,
    setFechaHasta,
  ] = useState('')

  const [
    filtros,
    setFiltros,
  ] = useState({
    fechaDesde: '',
    fechaHasta: '',
  })

  const [
    estadisticas,
    setEstadisticas,
  ] = useState(null)

  const [
    cargando,
    setCargando,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const cargarEstadisticas =
    useCallback(
      async () => {
        setCargando(true)
        setError('')

        try {
          const respuesta =
            await statisticsService
              .obtenerEstadisticas(
                filtros,
              )

          setEstadisticas(
            respuesta,
          )
        } catch (err) {
          setEstadisticas(null)

          setError(
            obtenerMensajeError(
              err,
            ),
          )
        } finally {
          setCargando(false)
        }
      },
      [filtros],
    )

  useEffect(() => {
    cargarEstadisticas()
  }, [cargarEstadisticas])

  const aplicarPeriodo = (
    event,
  ) => {
    event.preventDefault()

    setError('')

    if (
      fechaDesde &&
      fechaHasta &&
      fechaDesde >
        fechaHasta
    ) {
      setError(
        'La fecha inicial no puede ser posterior a la fecha final.',
      )

      return
    }

    setFiltros({
      fechaDesde,
      fechaHasta,
    })
  }

  const limpiarPeriodo = () => {
    setFechaDesde('')
    setFechaHasta('')

    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
    })
  }

  const sinDatos =
    useMemo(() => {
      if (!estadisticas) {
        return false
      }

      return (
        estadisticas
          .totalUsuarios ===
          0 &&
        estadisticas
          .totalServicios ===
          0 &&
        estadisticas
          .totalSolicitudes ===
          0 &&
        estadisticas
          .totalReportes ===
          0
      )
    }, [estadisticas])

  const indicadores =
    useMemo(
      () => [
        {
          titulo:
            'Usuarios registrados',

          valor:
            estadisticas
              ?.totalUsuarios ??
            0,

          descripcion:
            'Total de cuentas de Cliente y Trabajador.',

          icono:
            <GroupsOutlined />,
        },

        {
          titulo:
            'Clientes',

          valor:
            estadisticas
              ?.totalClientes ??
            0,

          descripcion:
            'Usuarios registrados con rol Cliente.',

          icono:
            <PersonOutlineOutlined />,
        },

        {
          titulo:
            'Trabajadores',

          valor:
            estadisticas
              ?.totalTrabajadores ??
            0,

          descripcion:
            'Usuarios registrados con rol Trabajador.',

          icono:
            <HandymanOutlined />,
        },

        {
          titulo:
            'Servicios publicados',

          valor:
            estadisticas
              ?.totalServicios ??
            0,

          descripcion:
            'Servicios publicados en la plataforma.',

          icono:
            <WorkOutlineOutlined />,
        },

        {
          titulo:
            'Solicitudes realizadas',

          valor:
            estadisticas
              ?.totalSolicitudes ??
            0,

          descripcion:
            'Solicitudes de servicio registradas.',

          icono:
            <BarChartOutlined />,
        },

        {
          titulo:
            'Solicitudes completadas',

          valor:
            estadisticas
              ?.totalSolicitudesCompletadas ??
            0,

          descripcion:
            'Solicitudes finalizadas satisfactoriamente.',

          icono:
            <AssignmentTurnedInOutlined />,
        },

        {
          titulo:
            'Reportes registrados',

          valor:
            estadisticas
              ?.totalReportes ??
            0,

          descripcion:
            'Reportes enviados por los usuarios.',

          icono:
            <FlagOutlined />,
        },
      ],
      [estadisticas],
    )

  const datosUsuarios =
    useMemo(
      () => [
        {
          nombre:
            'Clientes',

          cantidad:
            estadisticas
              ?.totalClientes ??
            0,
        },

        {
          nombre:
            'Trabajadores',

          cantidad:
            estadisticas
              ?.totalTrabajadores ??
            0,
        },
      ],
      [estadisticas],
    )

  const datosActividad =
    useMemo(
      () => [
        {
          nombre:
            'Servicios',

          cantidad:
            estadisticas
              ?.totalServicios ??
            0,
        },

        {
          nombre:
            'Solicitudes',

          cantidad:
            estadisticas
              ?.totalSolicitudes ??
            0,
        },

        {
          nombre:
            'Completadas',

          cantidad:
            estadisticas
              ?.totalSolicitudesCompletadas ??
            0,
        },

        {
          nombre:
            'Reportes',

          cantidad:
            estadisticas
              ?.totalReportes ??
            0,
        },
      ],
      [estadisticas],
    )

  const datosSolicitudes =
    useMemo(
      () => [
        {
          nombre:
            'Pendientes',

          cantidad:
            estadisticas
              ?.solicitudesPendientes ??
            0,
        },

        {
          nombre:
            'Aceptadas',

          cantidad:
            estadisticas
              ?.solicitudesAceptadas ??
            0,
        },

        {
          nombre:
            'En proceso',

          cantidad:
            estadisticas
              ?.solicitudesEnProceso ??
            0,
        },

        {
          nombre:
            'Completadas',

          cantidad:
            estadisticas
              ?.totalSolicitudesCompletadas ??
            0,
        },

        {
          nombre:
            'Rechazadas',

          cantidad:
            estadisticas
              ?.solicitudesRechazadas ??
            0,
        },

        {
          nombre:
            'Canceladas',

          cantidad:
            estadisticas
              ?.solicitudesCanceladas ??
            0,
        },
      ],
      [estadisticas],
    )

  const tituloPeriodo =
    useMemo(() => {
      if (
        !filtros.fechaDesde &&
        !filtros.fechaHasta
      ) {
        return 'Todos los registros'
      }

      if (
        filtros.fechaDesde &&
        filtros.fechaHasta
      ) {
        return `${formatearFechaTexto(
          filtros.fechaDesde,
        )} - ${formatearFechaTexto(
          filtros.fechaHasta,
        )}`
      }

      if (
        filtros.fechaDesde
      ) {
        return `Desde ${formatearFechaTexto(
          filtros.fechaDesde,
        )}`
      }

      return `Hasta ${formatearFechaTexto(
        filtros.fechaHasta,
      )}`
    }, [filtros])

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs:
              'flex-start',
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
              color:
                '#101828',
            }}
          >
            Estadísticas de la plataforma
          </Typography>

          <Typography
            sx={{
              color:
                '#667085',
              fontSize: 15,
              mt: 0.7,
            }}
          >
            Consulta indicadores generales sobre el funcionamiento de ConnectaOficios.
          </Typography>
        </Box>

        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            backgroundColor:
              '#F0FDFA',
            color:
              '#0D9488',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
          }}
        >
          <AssessmentOutlined />
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
            color:
              '#101828',
            fontSize: 16,
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          Período de análisis
        </Typography>

        <Typography
          sx={{
            color:
              '#667085',
            fontSize: 13,
            mb: 2.5,
          }}
        >
          Selecciona un rango para mostrar únicamente la actividad registrada durante ese período.
        </Typography>

        <Box
          component="form"
          onSubmit={
            aplicarPeriodo
          }
          sx={{
            display: 'grid',
            gridTemplateColumns:
              {
                xs: '1fr',
                sm:
                  'repeat(2, minmax(0, 1fr))',
                lg:
                  '220px 220px auto',
              },
            gap: 2,
            alignItems:
              'end',
          }}
        >
          <Box>
            <Typography
              component="label"
              htmlFor="fechaDesde"
              sx={{
                color:
                  '#344054',
                fontSize: 12,
                fontWeight: 700,
                display: 'block',
                mb: 0.8,
              }}
            >
              Fecha desde
            </Typography>

            <Box
              component="input"
              id="fechaDesde"
              type="date"
              value={fechaDesde}
              max={hoy}
              onChange={(
                event,
              ) =>
                setFechaDesde(
                  event.target
                    .value,
                )
              }
              sx={{
                width: '100%',
                boxSizing:
                  'border-box',
                height: 54,
                border:
                  '1px solid #D0D5DD',
                borderRadius: 2,
                px: 1.7,
                fontFamily:
                  'inherit',
                fontSize: 14,
                color:
                  '#344054',
                backgroundColor:
                  '#FFFFFF',
                outline: 'none',

                '&:focus': {
                  borderColor:
                    '#0D9488',
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="fechaHasta"
              sx={{
                color:
                  '#344054',
                fontSize: 12,
                fontWeight: 700,
                display: 'block',
                mb: 0.8,
              }}
            >
              Fecha hasta
            </Typography>

            <Box
              component="input"
              id="fechaHasta"
              type="date"
              value={fechaHasta}
              max={hoy}
              onChange={(
                event,
              ) =>
                setFechaHasta(
                  event.target
                    .value,
                )
              }
              sx={{
                width: '100%',
                boxSizing:
                  'border-box',
                height: 54,
                border:
                  '1px solid #D0D5DD',
                borderRadius: 2,
                px: 1.7,
                fontFamily:
                  'inherit',
                fontSize: 14,
                color:
                  '#344054',
                backgroundColor:
                  '#FFFFFF',
                outline: 'none',

                '&:focus': {
                  borderColor:
                    '#0D9488',
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1.2,
              flexWrap:
                'wrap',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={cargando}
              sx={{
                minHeight: 54,
                px: 2.5,
                borderRadius: 2,
                textTransform:
                  'none',
                fontWeight: 700,
                backgroundColor:
                  '#0D9488',
                boxShadow:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#0F766E',
                  boxShadow:
                    'none',
                },
              }}
            >
              Aplicar período
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={
                limpiarPeriodo
              }
              disabled={cargando}
              sx={{
                minHeight: 54,
                px: 2.3,
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
                cargarEstadisticas
              }
              disabled={cargando}
              startIcon={
                <RefreshOutlined />
              }
              sx={{
                minHeight: 54,
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

        <Box
          sx={{
            mt: 2.5,
            px: 2,
            py: 1.3,
            borderRadius: 2,
            backgroundColor:
              '#F9FAFB',
            border:
              '1px solid #EAECF0',
          }}
        >
          <Typography
            sx={{
              color:
                '#475467',
              fontSize: 13,
            }}
          >
            Período actual:{' '}

            <Box
              component="span"
              sx={{
                fontWeight: 800,
                color:
                  '#101828',
              }}
            >
              {tituloPeriodo}
            </Box>
          </Typography>
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

      {cargando ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 400,
            border:
              '1px solid #EAECF0',
            borderRadius: 3,
            display: 'flex',
            flexDirection:
              'column',
            alignItems:
              'center',
            justifyContent:
              'center',
          }}
        >
          <CircularProgress />

          <Typography
            sx={{
              color:
                '#667085',
              fontSize: 14,
              mt: 2,
            }}
          >
            Cargando estadísticas...
          </Typography>
        </Paper>
      ) : sinDatos ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 370,
            border:
              '1px solid #EAECF0',
            borderRadius: 3,
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
          <Box
            sx={{
              width: 78,
              height: 78,
              borderRadius:
                '50%',
              backgroundColor:
                '#F2F4F7',
              color:
                '#667085',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              mb: 2.2,
            }}
          >
            <SearchOffOutlined
              sx={{
                fontSize: 38,
              }}
            />
          </Box>

          <Typography
            sx={{
              color:
                '#101828',
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            No existen datos disponibles
          </Typography>

          <Typography
            sx={{
              color:
                '#667085',
              fontSize: 14,
              maxWidth: 500,
              lineHeight: 1.7,
              mt: 1,
            }}
          >
            El período seleccionado no contiene información suficiente para generar las estadísticas solicitadas.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                {
                  xs: '1fr',
                  sm:
                    'repeat(2, minmax(0, 1fr))',
                  xl:
                    'repeat(4, minmax(0, 1fr))',
                },
              gap: 2,
              mb: 3,
            }}
          >
            {indicadores.map(
              (
                indicador,
              ) => (
                <TarjetaIndicador
                  key={
                    indicador.titulo
                  }
                  {...indicador}
                />
              ),
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                {
                  xs: '1fr',
                  lg:
                    'repeat(2, minmax(0, 1fr))',
                },
              gap: 3,
              mb: 3,
            }}
          >
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
              }}
            >
              <Typography
                sx={{
                  color:
                    '#101828',
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                Usuarios por rol
              </Typography>

              <Typography
                sx={{
                  color:
                    '#667085',
                  fontSize: 13,
                  mt: 0.4,
                  mb: 2,
                }}
              >
                Distribución entre Clientes y Trabajadores.
              </Typography>

              <Box
                sx={{
                  width: '100%',
                  height: 330,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        datosUsuarios
                      }
                      dataKey="cantidad"
                      nameKey="nombre"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      label
                    >
                      {datosUsuarios.map(
                        (
                          item,
                          index,
                        ) => (
                          <Cell
                            key={
                              item.nombre
                            }
                            fill={
                              COLORES[
                                index %
                                  COLORES.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

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
              }}
            >
              <Typography
                sx={{
                  color:
                    '#101828',
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                Actividad general
              </Typography>

              <Typography
                sx={{
                  color:
                    '#667085',
                  fontSize: 13,
                  mt: 0.4,
                  mb: 2,
                }}
              >
                Comparación de la actividad principal registrada.
              </Typography>

              <Box
                sx={{
                  width: '100%',
                  height: 330,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      datosActividad
                    }
                    margin={{
                      top: 20,
                      right: 15,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="nombre"
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                    />

                    <Tooltip />

                    <Bar
                      dataKey="cantidad"
                      name="Cantidad"
                      fill="#0D9488"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
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
            }}
          >
            <Typography
              sx={{
                color:
                  '#101828',
                fontSize: 17,
                fontWeight: 800,
              }}
            >
              Estado de las solicitudes
            </Typography>

            <Typography
              sx={{
                color:
                  '#667085',
                fontSize: 13,
                mt: 0.4,
                mb: 2,
              }}
            >
              Distribución de solicitudes según su estado actual.
            </Typography>

            <Box
              sx={{
                width: '100%',
                height: 350,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    datosSolicitudes
                  }
                  margin={{
                    top: 20,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="nombre"
                  />

                  <YAxis
                    allowDecimals={
                      false
                    }
                  />

                  <Tooltip />

                  <Bar
                    dataKey="cantidad"
                    name="Solicitudes"
                    fill="#2563EB"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  )
}