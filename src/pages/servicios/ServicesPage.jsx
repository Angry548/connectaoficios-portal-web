import {
  useCallback,
  useEffect,
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
  SettingsOutlined,
} from '@mui/icons-material'

import adminServicesService from '../../services/adminServicesService'
import adminUsersService from '../../services/adminUsersService'

const obtenerMensajeError = (
  error,
) => {
  if (!error.response) {
    return 'No fue posible conectar con el servidor.'
  }

  if (
    error.response.status === 401
  ) {
    return 'La sesión ha expirado. Inicie sesión nuevamente.'
  }

  if (
    error.response.status === 403
  ) {
    return 'No tiene permisos para realizar esta operación.'
  }

  if (
    error.response.status === 404
  ) {
    return (
      error.response.data
        ?.mensaje ||
      error.response.data
        ?.message ||
      'El recurso solicitado no existe.'
    )
  }

  return (
    error.response.data
      ?.mensaje ||
    error.response.data
      ?.message ||
    'Ocurrió un error al procesar la solicitud.'
  )
}

const formatearPrecio = (
  valor,
) => {
  if (
    valor === null ||
    valor === undefined
  ) {
    return ''
  }

  return new Intl.NumberFormat(
    'es-SV',
    {
      style: 'currency',
      currency: 'USD',
    },
  ).format(
    Number(valor),
  )
}

const formatearTarifa = (
  servicio,
) => {
  const minima =
    servicio?.tarifaMinima

  const maxima =
    servicio?.tarifaMaxima

  if (
    maxima === null ||
    maxima === undefined
  ) {
    return formatearPrecio(
      minima,
    )
  }

  if (
    Number(minima) ===
    Number(maxima)
  ) {
    return formatearPrecio(
      minima,
    )
  }

  return `${formatearPrecio(
    minima,
  )} - ${formatearPrecio(
    maxima,
  )}`
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(valor)
}

const obtenerEstado = (
  estado,
) => {
  return (
    estado === 'ACTIVO' ||
    estado === 'Activo'
  )
    ? 'ACTIVO'
    : 'INACTIVO'
}

export default function ServicesPage() {
  const [
    servicios,
    setServicios,
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
    texto,
    setTexto,
  ] = useState('')

  const [
    estado,
    setEstado,
  ] = useState('')

  const [
    trabajadorTexto,
    setTrabajadorTexto,
  ] = useState('')

  const [
    trabajadorSeleccionado,
    setTrabajadorSeleccionado,
  ] = useState(null)

  const [
    trabajadoresOpciones,
    setTrabajadoresOpciones,
  ] = useState([])

  const [
    buscandoTrabajador,
    setBuscandoTrabajador,
  ] = useState(false)

  const [
    categoriaTexto,
    setCategoriaTexto,
  ] = useState('')

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState(null)

  const [
    categoriasOpciones,
    setCategoriasOpciones,
  ] = useState([])

  const [
    buscandoCategoria,
    setBuscandoCategoria,
  ] = useState(false)

  const [
    filtros,
    setFiltros,
  ] = useState({
    texto: '',
    trabajadorId: null,
    categoriaId: null,
    estado: '',
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
    servicioDetalle,
    setServicioDetalle,
  ] = useState(null)

  const [
    trabajadorDetalle,
    setTrabajadorDetalle,
  ] = useState(null)

  const [
    cargandoDetalle,
    setCargandoDetalle,
  ] = useState(false)

  const [
    servicioCambioEstado,
    setServicioCambioEstado,
  ] = useState(null)

  const [
    confirmacionAbierta,
    setConfirmacionAbierta,
  ] = useState(false)

  const [
    cambiandoEstado,
    setCambiandoEstado,
  ] = useState(false)

  const [
    mensaje,
    setMensaje,
  ] = useState('')

  useEffect(() => {
    const textoLimpio =
      trabajadorTexto.trim()

    if (
      textoLimpio.length < 2
    ) {
      setTrabajadoresOpciones(
        [],
      )

      setBuscandoTrabajador(
        false,
      )

      return undefined
    }

    const timeout =
      window.setTimeout(
        async () => {
          setBuscandoTrabajador(
            true,
          )

          try {
            const respuesta =
              await adminUsersService
                .buscarUsuarios(
                  textoLimpio,
                  2,
                  10,
                )

            setTrabajadoresOpciones(
              Array.isArray(
                respuesta,
              )
                ? respuesta
                : [],
            )
          } catch {
            setTrabajadoresOpciones(
              [],
            )
          } finally {
            setBuscandoTrabajador(
              false,
            )
          }
        },
        350,
      )

    return () => {
      window.clearTimeout(
        timeout,
      )
    }
  }, [trabajadorTexto])

  useEffect(() => {
    const textoLimpio =
      categoriaTexto.trim()

    if (
      textoLimpio.length < 2
    ) {
      setCategoriasOpciones(
        [],
      )

      setBuscandoCategoria(
        false,
      )

      return undefined
    }

    const timeout =
      window.setTimeout(
        async () => {
          setBuscandoCategoria(
            true,
          )

          try {
            const respuesta =
              await adminServicesService
                .buscarCategorias(
                  textoLimpio,
                  10,
                )

            setCategoriasOpciones(
              Array.isArray(
                respuesta,
              )
                ? respuesta
                : [],
            )
          } catch {
            setCategoriasOpciones(
              [],
            )
          } finally {
            setBuscandoCategoria(
              false,
            )
          }
        },
        350,
      )

    return () => {
      window.clearTimeout(
        timeout,
      )
    }
  }, [categoriaTexto])

  const cargarServicios =
    useCallback(
      async () => {
        setCargando(true)
        setError('')

        try {
          const respuesta =
            await adminServicesService
              .obtenerServicios({
                ...filtros,
                page: pagina,
                size:
                  tamanioPagina,
              })

          const lista =
            Array.isArray(
              respuesta.contenido,
            )
              ? respuesta.contenido
              : []

          const ids = [
            ...new Set(
              lista
                .map(
                  (
                    servicio,
                  ) =>
                    servicio
                      .trabajadorId,
                )
                .filter(
                  Boolean,
                ),
            ),
          ]

          const respuestas =
            await Promise
              .allSettled(
                ids.map(
                  (id) =>
                    adminUsersService
                      .obtenerUsuarioPorId(
                        id,
                      ),
                ),
              )

          const mapa =
            new Map()

          respuestas.forEach(
            (
              resultado,
              indice,
            ) => {
              if (
                resultado
                  .status ===
                'fulfilled'
              ) {
                mapa.set(
                  ids[indice],
                  resultado.value,
                )
              }
            },
          )

          const enriquecidos =
            lista.map(
              (
                servicio,
              ) => ({
                ...servicio,
                trabajador:
                  mapa.get(
                    servicio
                      .trabajadorId,
                  ) || null,
              }),
            )

          setServicios(
            enriquecidos,
          )

          setTotalElementos(
            respuesta
              .totalElementos,
          )
        } catch (err) {
          setServicios([])
          setTotalElementos(
            0,
          )

          setError(
            obtenerMensajeError(
              err,
            ),
          )
        } finally {
          setCargando(
            false,
          )
        }
      },
      [
        filtros,
        pagina,
        tamanioPagina,
      ],
    )

  useEffect(() => {
    cargarServicios()
  }, [cargarServicios])

  const aplicarFiltros = (
    event,
  ) => {
    event.preventDefault()

    setPagina(0)

    setFiltros({
      texto:
        texto.trim(),

      trabajadorId:
        trabajadorSeleccionado
          ?.id ??
        trabajadorSeleccionado
          ?.Id ??
        null,

      categoriaId:
        categoriaSeleccionada
          ?.id ??
        categoriaSeleccionada
          ?.Id ??
        null,

      estado,
    })
  }

  const limpiarFiltros =
    () => {
      setTexto('')
      setEstado('')

      setTrabajadorTexto(
        '',
      )

      setTrabajadorSeleccionado(
        null,
      )

      setTrabajadoresOpciones(
        [],
      )

      setCategoriaTexto(
        '',
      )

      setCategoriaSeleccionada(
        null,
      )

      setCategoriasOpciones(
        [],
      )

      setPagina(0)

      setFiltros({
        texto: '',
        trabajadorId:
          null,
        categoriaId: null,
        estado: '',
      })
    }

  const abrirDetalle =
    async (servicio) => {
      setDetalleAbierto(
        true,
      )

      setCargandoDetalle(
        true,
      )

      setServicioDetalle(
        null,
      )

      setTrabajadorDetalle(
        null,
      )

      try {
        const detalle =
          await adminServicesService
            .obtenerServicioPorId(
              servicio.id,
            )

        setServicioDetalle(
          detalle,
        )

        if (
          detalle
            .trabajadorId
        ) {
          try {
            const trabajador =
              await adminUsersService
                .obtenerUsuarioPorId(
                  detalle
                    .trabajadorId,
                )

            setTrabajadorDetalle(
              trabajador,
            )
          } catch {
            setTrabajadorDetalle(
              null,
            )
          }
        }
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

  const cerrarDetalle =
    () => {
      if (
        cargandoDetalle
      ) {
        return
      }

      setDetalleAbierto(
        false,
      )

      setServicioDetalle(
        null,
      )

      setTrabajadorDetalle(
        null,
      )
    }

  const solicitarCambioEstado =
    (servicio) => {
      setServicioCambioEstado(
        servicio,
      )

      setConfirmacionAbierta(
        true,
      )
    }

  const cerrarConfirmacion =
    () => {
      if (
        cambiandoEstado
      ) {
        return
      }

      setConfirmacionAbierta(
        false,
      )

      setServicioCambioEstado(
        null,
      )
    }

  const confirmarCambioEstado =
    async () => {
      if (
        !servicioCambioEstado
      ) {
        return
      }

      const estadoActual =
        obtenerEstado(
          servicioCambioEstado
            .estado,
        )

      const nuevoEstado =
        estadoActual ===
        'ACTIVO'
          ? 'INACTIVO'
          : 'ACTIVO'

      setCambiandoEstado(
        true,
      )

      try {
        const actualizado =
          await adminServicesService
            .cambiarEstado(
              servicioCambioEstado
                .id,
              nuevoEstado,
            )

        setServicios(
          (
            actuales,
          ) =>
            actuales.map(
              (
                servicio,
              ) =>
                servicio.id ===
                actualizado.id
                  ? {
                      ...servicio,
                      ...actualizado,
                    }
                  : servicio,
            ),
        )

        setMensaje(
          nuevoEstado ===
          'ACTIVO'
            ? 'Servicio activado correctamente.'
            : 'Servicio desactivado correctamente.',
        )

        setConfirmacionAbierta(
          false,
        )

        setServicioCambioEstado(
          null,
        )
      } catch (err) {
        setError(
          obtenerMensajeError(
            err,
          ),
        )
      } finally {
        setCambiandoEstado(
          false,
        )
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

  const cambiarTamanioPagina =
    (event) => {
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
              fontWeight:
                800,
              color:
                '#101828',
            }}
          >
            Gestión de servicios
          </Typography>

          <Typography
            sx={{
              color:
                '#667085',
              fontSize: 15,
              mt: 0.7,
            }}
          >
            Supervisa los servicios publicados por los trabajadores.
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
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
          }}
        >
          <SettingsOutlined />
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
            color:
              '#101828',
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
              display:
                'grid',
              gridTemplateColumns:
                {
                  xs: '1fr',
                  md:
                    'repeat(2, minmax(0, 1fr))',
                  xl:
                    'repeat(4, minmax(0, 1fr))',
                },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Servicio"
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
              placeholder="Nombre del servicio"
            />

            <Autocomplete
              value={
                trabajadorSeleccionado
              }
              options={
                trabajadoresOpciones
              }
              loading={
                buscandoTrabajador
              }
              inputValue={
                trabajadorTexto
              }
              filterOptions={(
                options,
              ) =>
                options
              }
              onInputChange={(
                event,
                value,
                reason,
              ) => {
                setTrabajadorTexto(
                  value,
                )

                if (
                  reason ===
                  'clear'
                ) {
                  setTrabajadorSeleccionado(
                    null,
                  )

                  setTrabajadoresOpciones(
                    [],
                  )
                }
              }}
              onChange={(
                event,
                value,
              ) => {
                setTrabajadorSeleccionado(
                  value,
                )
              }}
              getOptionLabel={(
                option,
              ) =>
                option?.nombre ||
                option?.Nombre ||
                ''
              }
              isOptionEqualToValue={(
                option,
                value,
              ) =>
                (
                  option?.id ??
                  option?.Id
                ) ===
                (
                  value?.id ??
                  value?.Id
                )
              }
              noOptionsText={
                trabajadorTexto
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
                  label="Trabajador"
                  placeholder="Buscar trabajador"
                />
              )}
            />

            <Autocomplete
              value={
                categoriaSeleccionada
              }
              options={
                categoriasOpciones
              }
              loading={
                buscandoCategoria
              }
              inputValue={
                categoriaTexto
              }
              filterOptions={(
                options,
              ) =>
                options
              }
              onInputChange={(
                event,
                value,
                reason,
              ) => {
                setCategoriaTexto(
                  value,
                )

                if (
                  reason ===
                  'clear'
                ) {
                  setCategoriaSeleccionada(
                    null,
                  )

                  setCategoriasOpciones(
                    [],
                  )
                }
              }}
              onChange={(
                event,
                value,
              ) => {
                setCategoriaSeleccionada(
                  value,
                )
              }}
              getOptionLabel={(
                option,
              ) =>
                option?.nombre ||
                option?.Nombre ||
                ''
              }
              isOptionEqualToValue={(
                option,
                value,
              ) =>
                (
                  option?.id ??
                  option?.Id
                ) ===
                (
                  value?.id ??
                  value?.Id
                )
              }
              noOptionsText={
                categoriaTexto
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
                  label="Categoría"
                  placeholder="Buscar categoría"
                />
              )}
            />

            <FormControl
              fullWidth
            >
              <InputLabel>
                Estado
              </InputLabel>

              <Select
                value={
                  estado
                }
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
                <MenuItem
                  value=""
                >
                  Todos
                </MenuItem>

                <MenuItem
                  value="ACTIVO"
                >
                  Activo
                </MenuItem>

                <MenuItem
                  value="INACTIVO"
                >
                  Inactivo
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              mt: 2.5,
              display:
                'flex',
              flexDirection:
                {
                  xs:
                    'column',
                  sm: 'row',
                },
              gap: 1.5,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={
                cargando
              }
              sx={{
                minWidth: 150,
                minHeight: 44,
                borderRadius: 2,
                textTransform:
                  'none',
                fontWeight:
                  700,
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
              Aplicar filtros
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={
                limpiarFiltros
              }
              disabled={
                cargando
              }
              sx={{
                minWidth: 130,
                minHeight: 44,
                borderRadius: 2,
                textTransform:
                  'none',
                fontWeight:
                  700,
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
                cargarServicios
              }
              disabled={
                cargando
              }
              sx={{
                minHeight: 44,
                textTransform:
                  'none',
                fontWeight:
                  700,
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
          overflow:
            'hidden',
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
              fontWeight:
                700,
              color:
                '#101828',
            }}
          >
            Servicios publicados
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color:
                '#667085',
              mt: 0.4,
            }}
          >
            {totalElementos}{' '}
            {totalElementos ===
            1
              ? 'servicio encontrado'
              : 'servicios encontrados'}
          </Typography>
        </Box>

        {cargando ? (
          <Box
            sx={{
              minHeight:
                300,
              display:
                'flex',
              justifyContent:
                'center',
              alignItems:
                'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : servicios.length ===
          0 ? (
          <Box
            sx={{
              minHeight:
                280,
              display:
                'flex',
              flexDirection:
                'column',
              alignItems:
                'center',
              justifyContent:
                'center',
              textAlign:
                'center',
              px: 3,
            }}
          >
            <SettingsOutlined
              sx={{
                fontSize:
                  48,
                color:
                  '#98A2B3',
                mb: 1.5,
              }}
            />

            <Typography
              sx={{
                fontSize:
                  17,
                fontWeight:
                  700,
                color:
                  '#344054',
              }}
            >
              No se encontraron servicios
            </Typography>

            <Typography
              sx={{
                fontSize:
                  14,
                color:
                  '#667085',
                mt: 0.5,
              }}
            >
              Cambia los filtros e intenta nuevamente.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth:
                    1100,
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
                        color:
                          '#475467',
                      }}
                    >
                      Servicio
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                        color:
                          '#475467',
                      }}
                    >
                      Trabajador
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                        color:
                          '#475467',
                      }}
                    >
                      Categoría
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                        color:
                          '#475467',
                      }}
                    >
                      Precio
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                        color:
                          '#475467',
                      }}
                    >
                      Estado
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        width:
                          220,
                        fontWeight:
                          700,
                        color:
                          '#475467',
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {servicios.map(
                    (
                      servicio,
                    ) => {
                      const activo =
                        obtenerEstado(
                          servicio
                            .estado,
                        ) ===
                        'ACTIVO'

                      return (
                        <TableRow
                          key={
                            servicio
                              .id
                          }
                          hover
                        >
                          <TableCell>
                            <Typography
                              sx={{
                                fontSize:
                                  14,
                                fontWeight:
                                  700,
                                color:
                                  '#101828',
                              }}
                            >
                              {
                                servicio
                                  .titulo
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              sx={{
                                fontSize:
                                  14,
                                color:
                                  '#475467',
                              }}
                            >
                              {servicio
                                .trabajador
                                ?.nombre ||
                                `Trabajador #${servicio.trabajadorId}`}
                            </Typography>

                            {servicio
                              .trabajador
                              ?.correo && (
                              <Typography
                                sx={{
                                  fontSize:
                                    12,
                                  color:
                                    '#98A2B3',
                                }}
                              >
                                {
                                  servicio
                                    .trabajador
                                    .correo
                                }
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={
                                servicio
                                  .categoriaNombre ||
                                `Categoría #${servicio.categoriaId}`
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Typography
                              sx={{
                                fontSize:
                                  14,
                                fontWeight:
                                  600,
                                color:
                                  '#344054',
                              }}
                            >
                              {formatearTarifa(
                                servicio,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={
                                activo
                                  ? 'Activo'
                                  : 'Inactivo'
                              }
                              size="small"
                              color={
                                activo
                                  ? 'success'
                                  : 'default'
                              }
                              variant={
                                activo
                                  ? 'filled'
                                  : 'outlined'
                              }
                              sx={{
                                fontWeight:
                                  700,
                              }}
                            />
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{
                              width:
                                220,
                            }}
                          >
                            <Box
                              sx={{
                                display:
                                  'flex',
                                justifyContent:
                                  'center',
                                alignItems:
                                  'center',
                                gap: 1,
                              }}
                            >
                              <Button
                                size="small"
                                onClick={() =>
                                  abrirDetalle(
                                    servicio,
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

                              <Button
                                size="small"
                                variant="outlined"
                                color={
                                  activo
                                    ? 'error'
                                    : 'success'
                                }
                                onClick={() =>
                                  solicitarCambioEstado(
                                    servicio,
                                  )
                                }
                                sx={{
                                  textTransform:
                                    'none',
                                  fontWeight:
                                    700,
                                }}
                              >
                                {activo
                                  ? 'Desactivar'
                                  : 'Activar'}
                              </Button>
                            </Box>
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
              page={
                pagina
              }
              onPageChange={
                cambiarPagina
              }
              rowsPerPage={
                tamanioPagina
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
                `${from}-${to} de ${
                  count !== -1
                    ? count
                    : `más de ${to}`
                }`
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
            fontWeight:
              800,
            color:
              '#101828',
          }}
        >
          Detalle del servicio
        </DialogTitle>

        <DialogContent
          dividers
        >
          {cargandoDetalle ? (
            <Box
              sx={{
                minHeight:
                  300,
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            servicioDetalle && (
              <Box
                sx={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#667085',
                    }}
                  >
                    Servicio
                  </Typography>

                  <Typography
                    sx={{
                      fontSize:
                        20,
                      fontWeight:
                        800,
                      color:
                        '#101828',
                      mt: 0.5,
                    }}
                  >
                    {
                      servicioDetalle
                        .titulo
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#667085',
                    }}
                  >
                    Descripción
                  </Typography>

                  <Typography
                    sx={{
                      fontSize:
                        15,
                      color:
                        '#344054',
                      mt: 0.5,
                      lineHeight:
                        1.7,
                    }}
                  >
                    {
                      servicioDetalle
                        .descripcion
                    }
                  </Typography>
                </Box>

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
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize:
                          12,
                        fontWeight:
                          700,
                        color:
                          '#667085',
                      }}
                    >
                      Categoría
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontWeight:
                          700,
                      }}
                    >
                      {servicioDetalle
                        .categoriaNombre ||
                        `Categoría #${servicioDetalle.categoriaId}`}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize:
                          12,
                        fontWeight:
                          700,
                        color:
                          '#667085',
                      }}
                    >
                      Tarifa
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontWeight:
                          700,
                      }}
                    >
                      {formatearTarifa(
                        servicioDetalle,
                      )}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize:
                          12,
                        fontWeight:
                          700,
                        color:
                          '#667085',
                      }}
                    >
                      Estado
                    </Typography>

                    <Box
                      sx={{
                        mt: 0.8,
                      }}
                    >
                      <Chip
                        label={
                          obtenerEstado(
                            servicioDetalle
                              .estado,
                          ) ===
                          'ACTIVO'
                            ? 'Activo'
                            : 'Inactivo'
                        }
                        color={
                          obtenerEstado(
                            servicioDetalle
                              .estado,
                          ) ===
                          'ACTIVO'
                            ? 'success'
                            : 'default'
                        }
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize:
                          12,
                        fontWeight:
                          700,
                        color:
                          '#667085',
                      }}
                    >
                      ID del servicio
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      {
                        servicioDetalle
                          .id
                      }
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    sx={{
                      fontSize:
                        17,
                      fontWeight:
                        800,
                      color:
                        '#101828',
                      mb: 2,
                    }}
                  >
                    Trabajador propietario
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
                    <Box>
                      <Typography
                        sx={{
                          fontSize:
                            12,
                          fontWeight:
                            700,
                          color:
                            '#667085',
                        }}
                      >
                        Nombre
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight:
                            700,
                        }}
                      >
                        {trabajadorDetalle
                          ?.nombre ||
                          'No disponible'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize:
                            12,
                          fontWeight:
                            700,
                          color:
                            '#667085',
                        }}
                      >
                        Correo
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        {trabajadorDetalle
                          ?.correo ||
                          'No disponible'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize:
                            12,
                          fontWeight:
                            700,
                          color:
                            '#667085',
                        }}
                      >
                        Teléfono
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        {trabajadorDetalle
                          ?.telefono ||
                          'No registrado'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize:
                            12,
                          fontWeight:
                            700,
                          color:
                            '#667085',
                        }}
                      >
                        ID trabajador
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        {
                          servicioDetalle
                            .trabajadorId
                        }
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    sx={{
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#667085',
                    }}
                  >
                    Zonas de cobertura
                  </Typography>

                  <Box
                    sx={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      flexWrap:
                        'wrap',
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    {servicioDetalle
                      .zonasCoberturaIds
                      ?.length >
                    0 ? (
                      servicioDetalle
                        .zonasCoberturaIds
                        .map(
                          (
                            zonaId,
                          ) => (
                            <Chip
                              key={
                                zonaId
                              }
                              label={`Zona #${zonaId}`}
                              size="small"
                              variant="outlined"
                            />
                          ),
                        )
                    ) : (
                      <Typography
                        sx={{
                          color:
                            '#667085',
                        }}
                      >
                        Sin zonas registradas
                      </Typography>
                    )}
                  </Box>
                </Box>

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
                  <Box>
                    <Typography
                      sx={{
                        fontSize:
                          12,
                        fontWeight:
                          700,
                        color:
                          '#667085',
                      }}
                    >
                      Fecha de creación
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      {formatearFecha(
                        servicioDetalle
                          .fechaCreacion,
                      )}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize:
                          12,
                        fontWeight:
                          700,
                        color:
                          '#667085',
                      }}
                    >
                      Última actualización
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      {formatearFecha(
                        servicioDetalle
                          .fechaActualizacion,
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={
              cerrarDetalle
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
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={
          confirmacionAbierta
        }
        onClose={
          cerrarConfirmacion
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight:
              800,
            color:
              '#101828',
          }}
        >
          {obtenerEstado(
            servicioCambioEstado
              ?.estado,
          ) === 'ACTIVO'
            ? 'Desactivar servicio'
            : 'Activar servicio'}
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color:
                '#475467',
              lineHeight:
                1.7,
            }}
          >
            {obtenerEstado(
              servicioCambioEstado
                ?.estado,
            ) === 'ACTIVO'
              ? `¿Está seguro de que desea desactivar "${servicioCambioEstado?.titulo}"? El servicio dejará de estar disponible para los clientes.`
              : `¿Está seguro de que desea activar nuevamente "${servicioCambioEstado?.titulo}"?`}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={
              cerrarConfirmacion
            }
            disabled={
              cambiandoEstado
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
              obtenerEstado(
                servicioCambioEstado
                  ?.estado,
              ) === 'ACTIVO'
                ? 'error'
                : 'success'
            }
            onClick={
              confirmarCambioEstado
            }
            disabled={
              cambiandoEstado
            }
            sx={{
              minWidth:
                120,
              minHeight:
                40,
              textTransform:
                'none',
              fontWeight:
                700,
              boxShadow:
                'none',
            }}
          >
            {cambiandoEstado ? (
              <CircularProgress
                size={20}
                sx={{
                  color:
                    '#FFFFFF',
                }}
              />
            ) : obtenerEstado(
                servicioCambioEstado
                  ?.estado,
              ) ===
              'ACTIVO' ? (
              'Desactivar'
            ) : (
              'Activar'
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