import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import {
  AddOutlined,
  AdminPanelSettingsOutlined,
  DeleteOutlineOutlined,
  EditOutlined,
  MoreVertOutlined,
  PersonOffOutlined,
  PersonOutlineOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'

import adminAccountsService from '../../services/adminAccountsService'
import { useAuth } from '../../context/AuthContext'

const obtenerMensajeError = (
  error,
) => {
  if (!error?.response) {
    return (
      error?.message ||
      'No fue posible conectar con el servidor.'
    )
  }

  const mensaje =
    error.response.data
      ?.message ||
    error.response.data
      ?.mensaje

  if (
    error.response.status ===
    400
  ) {
    return (
      mensaje ||
      'Verifique los datos ingresados.'
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
    return 'Acceso no autorizado.'
  }

  if (
    error.response.status ===
    404
  ) {
    return (
      mensaje ||
      'La cuenta administrativa no existe.'
    )
  }

  if (
    error.response.status ===
    409
  ) {
    return (
      mensaje ||
      'La operación no puede realizarse.'
    )
  }

  return (
    mensaje ||
    'Ocurrió un error al procesar la solicitud.'
  )
}

const obtenerColorEstado = (
  estado,
) => {
  return estado === 'Activo'
    ? 'success'
    : 'default'
}

const formatearRol = (
  rol,
) => {
  if (
    rol ===
    'AdministradorPrincipal'
  ) {
    return 'Administrador Principal'
  }

  return (
    rol ||
    'Administrador'
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(valor)
}

const validarCorreo = (
  correo,
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    correo,
  )
}

const formularioInicial = {
  nombre: '',
  correo: '',
  password: '',
  telefono: '',
  rolId: '3',
}

export default function AdministratorsPage() {
  const {
    usuario: usuarioActual,
  } = useAuth()

  const [
    administradores,
    setAdministradores,
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
    nombre,
    setNombre,
  ] = useState('')

  const [
    correo,
    setCorreo,
  ] = useState('')

  const [
    rolId,
    setRolId,
  ] = useState('')

  const [
    estado,
    setEstado,
  ] = useState('')

  const [
    filtros,
    setFiltros,
  ] = useState({
    nombre: '',
    correo: '',
    rolId: '',
    estado: '',
  })

  const [
    pagina,
    setPagina,
  ] = useState(1)

  const [
    tamanoPagina,
    setTamanoPagina,
  ] = useState(10)

  const [
    totalItems,
    setTotalItems,
  ] = useState(0)

  const [
    detalleAbierto,
    setDetalleAbierto,
  ] = useState(false)

  const [
    administradorDetalle,
    setAdministradorDetalle,
  ] = useState(null)

  const [
    cargandoDetalle,
    setCargandoDetalle,
  ] = useState(false)

  const [
    formularioAbierto,
    setFormularioAbierto,
  ] = useState(false)

  const [
    modoFormulario,
    setModoFormulario,
  ] = useState('crear')

  const [
    formulario,
    setFormulario,
  ] = useState(
    formularioInicial,
  )

  const [
    erroresFormulario,
    setErroresFormulario,
  ] = useState({})

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false)

  const [
    guardando,
    setGuardando,
  ] = useState(false)

  const [
    administradorSeleccionado,
    setAdministradorSeleccionado,
  ] = useState(null)

  const [
    menuAnchor,
    setMenuAnchor,
  ] = useState(null)

  const [
    confirmacionEstadoAbierta,
    setConfirmacionEstadoAbierta,
  ] = useState(false)

  const [
    confirmacionEliminarAbierta,
    setConfirmacionEliminarAbierta,
  ] = useState(false)

  const [
    procesando,
    setProcesando,
  ] = useState(false)

  const cargarAdministradores =
    useCallback(
      async () => {
        setCargando(true)
        setError('')

        try {
          const respuesta =
            await adminAccountsService
              .obtenerAdministradores({
                ...filtros,
                page:
                  pagina,
                pageSize:
                  tamanoPagina,
              })

          setAdministradores(
            respuesta.items ??
              respuesta.Items ??
              [],
          )

          setTotalItems(
            respuesta.totalItems ??
              respuesta.TotalItems ??
              0,
          )
        } catch (err) {
          setAdministradores(
            [],
          )

          setTotalItems(0)

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
        tamanoPagina,
      ],
    )

  useEffect(() => {
    cargarAdministradores()
  }, [cargarAdministradores])

  const aplicarFiltros = (
    event,
  ) => {
    event.preventDefault()

    setPagina(1)

    setFiltros({
      nombre:
        nombre.trim(),

      correo:
        correo.trim(),

      rolId,

      estado,
    })
  }

  const limpiarFiltros = () => {
    setNombre('')
    setCorreo('')
    setRolId('')
    setEstado('')
    setPagina(1)

    setFiltros({
      nombre: '',
      correo: '',
      rolId: '',
      estado: '',
    })
  }

  const abrirDetalle =
    async (administrador) => {
      cerrarMenu()

      setDetalleAbierto(
        true,
      )

      setCargandoDetalle(
        true,
      )

      setAdministradorDetalle(
        null,
      )

      try {
        const respuesta =
          await adminAccountsService
            .obtenerAdministradorPorId(
              administrador.id,
            )

        setAdministradorDetalle(
          respuesta,
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
    if (cargandoDetalle) {
      return
    }

    setDetalleAbierto(
      false,
    )

    setAdministradorDetalle(
      null,
    )
  }

  const abrirCrear = () => {
    setModoFormulario(
      'crear',
    )

    setFormulario(
      formularioInicial,
    )

    setErroresFormulario(
      {},
    )

    setMostrarPassword(
      false,
    )

    setFormularioAbierto(
      true,
    )
  }

  const abrirEditar =
    async (administrador) => {
      cerrarMenu()

      setModoFormulario(
        'editar',
      )

      setErroresFormulario(
        {},
      )

      setMostrarPassword(
        false,
      )

      try {
        setGuardando(true)

        const detalle =
          await adminAccountsService
            .obtenerAdministradorPorId(
              administrador.id,
            )

        setFormulario({
          id:
            detalle.id,

          nombre:
            detalle.nombre ||
            '',

          correo:
            detalle.correo ||
            '',

          password: '',

          telefono:
            detalle.telefono ||
            '',

          rolId:
            String(
              detalle.rolId,
            ),
        })

        setFormularioAbierto(
          true,
        )
      } catch (err) {
        setError(
          obtenerMensajeError(
            err,
          ),
        )
      } finally {
        setGuardando(false)
      }
    }

  const cerrarFormulario = () => {
    if (guardando) {
      return
    }

    setFormularioAbierto(
      false,
    )

    setFormulario(
      formularioInicial,
    )

    setErroresFormulario(
      {},
    )
  }

  const actualizarCampo = (
    campo,
    valor,
  ) => {
    setFormulario(
      (actual) => ({
        ...actual,
        [campo]:
          valor,
      }),
    )

    setErroresFormulario(
      (actual) => ({
        ...actual,
        [campo]:
          '',
      }),
    )
  }

  const validarFormulario =
    () => {
      const errores = {}

      if (
        !formulario.nombre.trim()
      ) {
        errores.nombre =
          'El nombre es obligatorio.'
      } else if (
        formulario.nombre
          .trim().length >
        100
      ) {
        errores.nombre =
          'El nombre no puede superar los 100 caracteres.'
      }

      if (
        !formulario.correo.trim()
      ) {
        errores.correo =
          'El correo electrónico es obligatorio.'
      } else if (
        !validarCorreo(
          formulario.correo
            .trim(),
        )
      ) {
        errores.correo =
          'Ingrese un correo electrónico válido.'
      } else if (
        formulario.correo
          .trim().length >
        150
      ) {
        errores.correo =
          'El correo no puede superar los 150 caracteres.'
      }

      if (
        modoFormulario ===
        'crear'
      ) {
        if (
          !formulario.password
        ) {
          errores.password =
            'La contraseña es obligatoria.'
        } else if (
          formulario.password
            .length < 6
        ) {
          errores.password =
            'La contraseña debe contener al menos 6 caracteres.'
        }

        if (
          formulario.rolId !==
            '3' &&
          formulario.rolId !==
            '4'
        ) {
          errores.rolId =
            'Seleccione un rol administrativo válido.'
        }
      }

      if (
        formulario.telefono
          .trim().length >
        25
      ) {
        errores.telefono =
          'El teléfono no puede superar los 25 caracteres.'
      }

      setErroresFormulario(
        errores,
      )

      return (
        Object.keys(
          errores,
        ).length === 0
      )
    }

  const guardarFormulario =
    async (event) => {
      event.preventDefault()

      if (
        !validarFormulario()
      ) {
        return
      }

      setGuardando(true)
      setError('')

      try {
        if (
          modoFormulario ===
          'crear'
        ) {
          await adminAccountsService
            .crearAdministrador({
              nombre:
                formulario.nombre,

              correo:
                formulario.correo,

              password:
                formulario.password,

              telefono:
                formulario.telefono,

              rolId:
                formulario.rolId,
            })

          setMensaje(
            'Cuenta administrativa creada correctamente.',
          )
        } else {
          await adminAccountsService
            .actualizarAdministrador(
              formulario.id,
              {
                nombre:
                  formulario.nombre,

                correo:
                  formulario.correo,

                telefono:
                  formulario.telefono,
              },
            )

          setMensaje(
            'Cuenta administrativa actualizada correctamente.',
          )
        }

        setFormularioAbierto(
          false,
        )

        setFormulario(
          formularioInicial,
        )

        setPagina(1)

        await cargarAdministradores()
      } catch (err) {
        setError(
          obtenerMensajeError(
            err,
          ),
        )
      } finally {
        setGuardando(false)
      }
    }

  const abrirMenu = (
    event,
    administrador,
  ) => {
    setMenuAnchor(
      event.currentTarget,
    )

    setAdministradorSeleccionado(
      administrador,
    )
  }

  const cerrarMenu = () => {
    setMenuAnchor(null)
  }

  const solicitarCambioEstado =
    (administrador) => {
      cerrarMenu()

      setAdministradorSeleccionado(
        administrador,
      )

      setConfirmacionEstadoAbierta(
        true,
      )
    }

  const cerrarConfirmacionEstado =
    () => {
      if (procesando) {
        return
      }

      setConfirmacionEstadoAbierta(
        false,
      )

      setAdministradorSeleccionado(
        null,
      )
    }

  const confirmarCambioEstado =
    async () => {
      if (
        !administradorSeleccionado
      ) {
        return
      }

      const nuevoEstado =
        administradorSeleccionado
          .estado ===
        'Activo'
          ? 2
          : 1

      setProcesando(true)
      setError('')

      try {
        await adminAccountsService
          .cambiarEstado(
            administradorSeleccionado
              .id,
            nuevoEstado,
          )

        setMensaje(
          nuevoEstado === 1
            ? 'Cuenta administrativa activada correctamente.'
            : 'Cuenta administrativa desactivada correctamente.',
        )

        setConfirmacionEstadoAbierta(
          false,
        )

        setAdministradorSeleccionado(
          null,
        )

        await cargarAdministradores()
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

  const solicitarEliminar =
    (administrador) => {
      cerrarMenu()

      setAdministradorSeleccionado(
        administrador,
      )

      setConfirmacionEliminarAbierta(
        true,
      )
    }

  const cerrarConfirmacionEliminar =
    () => {
      if (procesando) {
        return
      }

      setConfirmacionEliminarAbierta(
        false,
      )

      setAdministradorSeleccionado(
        null,
      )
    }

  const confirmarEliminar =
    async () => {
      if (
        !administradorSeleccionado
      ) {
        return
      }

      setProcesando(true)
      setError('')

      try {
        await adminAccountsService
          .eliminarAdministrador(
            administradorSeleccionado
              .id,
          )

        setMensaje(
          'Cuenta administrativa eliminada correctamente.',
        )

        setConfirmacionEliminarAbierta(
          false,
        )

        setAdministradorSeleccionado(
          null,
        )

        if (
          administradores.length ===
            1 &&
          pagina > 1
        ) {
          setPagina(
            (actual) =>
              Math.max(
                1,
                actual - 1,
              ),
          )
        } else {
          await cargarAdministradores()
        }
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
      nuevaPagina + 1,
    )
  }

  const cambiarTamanoPagina =
    (event) => {
      setTamanoPagina(
        Number(
          event.target.value,
        ),
      )

      setPagina(1)
    }

  const esCuentaActual = (
    administrador,
  ) => {
    return (
      Number(
        administrador?.id,
      ) ===
      Number(
        usuarioActual?.id,
      )
    )
  }

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
            Gestión de administradores
          </Typography>

          <Typography
            sx={{
              color:
                '#667085',
              fontSize: 15,
              mt: 0.7,
            }}
          >
            Administra las cuentas y permisos del personal administrativo.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.5}
          sx={{
            width: {
              xs: '100%',
              sm: 'auto',
            },
          }}
        >
          <Button
            variant="contained"
            startIcon={
              <AddOutlined />
            }
            onClick={
              abrirCrear
            }
            sx={{
              minHeight: 46,
              borderRadius: 2,
              px: 2.5,
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
            Crear Administrador
          </Button>

          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              backgroundColor:
                '#F0FDFA',
              color:
                '#0D9488',
              display: {
                xs: 'none',
                sm: 'flex',
              },
              alignItems:
                'center',
              justifyContent:
                'center',
            }}
          >
            <AdminPanelSettingsOutlined />
          </Box>
        </Stack>
      </Box>

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
              display: 'grid',
              gridTemplateColumns:
                {
                  xs: '1fr',
                  md:
                    'repeat(2, minmax(0, 1fr))',
                  lg:
                    'repeat(4, minmax(0, 1fr))',
                },
              gap: 2,
            }}
          >
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(
                event,
              ) =>
                setNombre(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Buscar por nombre"
              fullWidth
            />

            <TextField
              label="Correo electrónico"
              value={correo}
              onChange={(
                event,
              ) =>
                setCorreo(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Buscar por correo"
              fullWidth
            />

            <FormControl
              fullWidth
            >
              <InputLabel>
                Rol
              </InputLabel>

              <Select
                value={rolId}
                label="Rol"
                onChange={(
                  event,
                ) =>
                  setRolId(
                    event
                      .target
                      .value,
                  )
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>

                <MenuItem value="3">
                  Administrador
                </MenuItem>

                <MenuItem value="4">
                  Administrador Principal
                </MenuItem>
              </Select>
            </FormControl>

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

                <MenuItem value="1">
                  Activo
                </MenuItem>

                <MenuItem value="2">
                  Inactivo
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1.5}
            sx={{
              mt: 2.5,
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
              disabled={cargando}
              sx={{
                minWidth: 130,
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
                cargarAdministradores
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
          </Stack>
        </Box>
      </Paper>

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
              fontWeight: 700,
              color:
                '#101828',
            }}
          >
            Cuentas administrativas
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color:
                '#667085',
              mt: 0.4,
            }}
          >
            {totalItems}{' '}
            {totalItems === 1
              ? 'cuenta encontrada'
              : 'cuentas encontradas'}
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
        ) : administradores
            .length === 0 ? (
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
            <AdminPanelSettingsOutlined
              sx={{
                fontSize: 52,
                color:
                  '#98A2B3',
                mb: 1.5,
              }}
            />

            <Typography
              sx={{
                fontWeight: 700,
                color:
                  '#344054',
                fontSize: 17,
              }}
            >
              No se encontraron administradores
            </Typography>

            <Typography
              sx={{
                color:
                  '#667085',
                fontSize: 14,
                mt: 0.5,
              }}
            >
              Cambie los filtros o cree una nueva cuenta administrativa.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth: 900,
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
                      Nombre
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      Correo electrónico
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      Rol
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
                        width: 100,
                        fontWeight:
                          700,
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {administradores.map(
                    (
                      administrador,
                    ) => (
                      <TableRow
                        key={
                          administrador.id
                        }
                        hover
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: 1.4,
                            }}
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius:
                                  '50%',
                                backgroundColor:
                                  '#F0FDFA',
                                color:
                                  '#0D9488',
                                display:
                                  'flex',
                                justifyContent:
                                  'center',
                                alignItems:
                                  'center',
                                flexShrink:
                                  0,
                              }}
                            >
                              <PersonOutlineOutlined
                                fontSize="small"
                              />
                            </Box>

                            <Box>
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
                                  administrador.nombre
                                }
                              </Typography>

                              {esCuentaActual(
                                administrador,
                              ) && (
                                <Typography
                                  sx={{
                                    fontSize:
                                      11,
                                    color:
                                      '#0D9488',
                                    fontWeight:
                                      700,
                                    mt: 0.2,
                                  }}
                                >
                                  Tu cuenta
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize:
                                13,
                              color:
                                '#475467',
                            }}
                          >
                            {
                              administrador.correo
                            }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={formatearRol(
                              administrador.rol,
                            )}
                            size="small"
                            variant="outlined"
                            color={
                              administrador.rol ===
                              'AdministradorPrincipal'
                                ? 'primary'
                                : 'default'
                            }
                            sx={{
                              fontWeight:
                                700,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              administrador.estado
                            }
                            size="small"
                            color={obtenerColorEstado(
                              administrador.estado,
                            )}
                            sx={{
                              fontWeight:
                                700,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          align="center"
                        >
                          <Tooltip title="Acciones">
                            <IconButton
                              onClick={(
                                event,
                              ) =>
                                abrirMenu(
                                  event,
                                  administrador,
                                )
                              }
                            >
                              <MoreVertOutlined />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={
                totalItems
              }
              page={
                pagina - 1
              }
              rowsPerPage={
                tamanoPagina
              }
              onPageChange={
                cambiarPagina
              }
              onRowsPerPageChange={
                cambiarTamanoPagina
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

      <Menu
        anchorEl={
          menuAnchor
        }
        open={
          Boolean(
            menuAnchor,
          )
        }
        onClose={
          cerrarMenu
        }
      >
        <MenuItem
          onClick={() =>
            abrirDetalle(
              administradorSeleccionado,
            )
          }
        >
          <VisibilityOutlined
            fontSize="small"
            sx={{
              mr: 1.4,
            }}
          />

          Ver detalle
        </MenuItem>

        <MenuItem
          onClick={() =>
            abrirEditar(
              administradorSeleccionado,
            )
          }
        >
          <EditOutlined
            fontSize="small"
            sx={{
              mr: 1.4,
            }}
          />

          Editar
        </MenuItem>

        <MenuItem
          onClick={() =>
            solicitarCambioEstado(
              administradorSeleccionado,
            )
          }
          disabled={esCuentaActual(
            administradorSeleccionado,
          )}
        >
          <PersonOffOutlined
            fontSize="small"
            sx={{
              mr: 1.4,
            }}
          />

          {administradorSeleccionado
            ?.estado ===
          'Activo'
            ? 'Desactivar'
            : 'Activar'}
        </MenuItem>

        <MenuItem
          onClick={() =>
            solicitarEliminar(
              administradorSeleccionado,
            )
          }
          disabled={esCuentaActual(
            administradorSeleccionado,
          )}
          sx={{
            color:
              '#D92D20',
          }}
        >
          <DeleteOutlineOutlined
            fontSize="small"
            sx={{
              mr: 1.4,
            }}
          />

          Eliminar
        </MenuItem>
      </Menu>

      <Dialog
        open={
          detalleAbierto
        }
        onClose={
          cerrarDetalle
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color:
              '#101828',
          }}
        >
          Información de la cuenta
        </DialogTitle>

        <DialogContent
          dividers
        >
          {cargandoDetalle ? (
            <Box
              sx={{
                minHeight: 260,
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
            administradorDetalle && (
              <Stack
                spacing={2.5}
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
                    Nombre
                  </Typography>

                  <Typography
                    sx={{
                      color:
                        '#101828',
                      fontSize:
                        15,
                      fontWeight:
                        700,
                      mt: 0.4,
                    }}
                  >
                    {
                      administradorDetalle.nombre
                    }
                  </Typography>
                </Box>

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
                    Correo electrónico
                  </Typography>

                  <Typography
                    sx={{
                      color:
                        '#344054',
                      fontSize:
                        14,
                      mt: 0.4,
                    }}
                  >
                    {
                      administradorDetalle.correo
                    }
                  </Typography>
                </Box>

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
                    Teléfono
                  </Typography>

                  <Typography
                    sx={{
                      color:
                        '#344054',
                      fontSize:
                        14,
                      mt: 0.4,
                    }}
                  >
                    {administradorDetalle.telefono ||
                      'No registrado'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.2,
                    flexWrap:
                      'wrap',
                  }}
                >
                  <Chip
                    label={formatearRol(
                      administradorDetalle.rol,
                    )}
                    variant="outlined"
                    color={
                      administradorDetalle.rol ===
                      'AdministradorPrincipal'
                        ? 'primary'
                        : 'default'
                    }
                  />

                  <Chip
                    label={
                      administradorDetalle.estado
                    }
                    color={obtenerColorEstado(
                      administradorDetalle.estado,
                    )}
                  />
                </Box>

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
                    Fecha de creación
                  </Typography>

                  <Typography
                    sx={{
                      color:
                        '#344054',
                      fontSize:
                        14,
                      mt: 0.4,
                    }}
                  >
                    {formatearFecha(
                      administradorDetalle.fechaCreacion,
                    )}
                  </Typography>
                </Box>
              </Stack>
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
          formularioAbierto
        }
        onClose={
          cerrarFormulario
        }
        fullWidth
        maxWidth="sm"
      >
        <Box
          component="form"
          onSubmit={
            guardarFormulario
          }
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              color:
                '#101828',
            }}
          >
            {modoFormulario ===
            'crear'
              ? 'Crear Administrador'
              : 'Editar cuenta administrativa'}
          </DialogTitle>

          <DialogContent
            dividers
          >
            <Stack
              spacing={2.3}
              sx={{
                pt: 0.5,
              }}
            >
              <TextField
                fullWidth
                label="Nombre"
                value={
                  formulario.nombre
                }
                onChange={(
                  event,
                ) =>
                  actualizarCampo(
                    'nombre',
                    event
                      .target
                      .value,
                  )
                }
                error={Boolean(
                  erroresFormulario.nombre,
                )}
                helperText={
                  erroresFormulario.nombre
                }
                disabled={
                  guardando
                }
                inputProps={{
                  maxLength:
                    100,
                }}
              />

              <TextField
                fullWidth
                type="email"
                label="Correo electrónico"
                value={
                  formulario.correo
                }
                onChange={(
                  event,
                ) =>
                  actualizarCampo(
                    'correo',
                    event
                      .target
                      .value,
                  )
                }
                error={Boolean(
                  erroresFormulario.correo,
                )}
                helperText={
                  erroresFormulario.correo
                }
                disabled={
                  guardando
                }
                inputProps={{
                  maxLength:
                    150,
                }}
              />

              {modoFormulario ===
                'crear' && (
                <TextField
                  fullWidth
                  type={
                    mostrarPassword
                      ? 'text'
                      : 'password'
                  }
                  label="Contraseña"
                  value={
                    formulario.password
                  }
                  onChange={(
                    event,
                  ) =>
                    actualizarCampo(
                      'password',
                      event
                        .target
                        .value,
                    )
                  }
                  error={Boolean(
                    erroresFormulario.password,
                  )}
                  helperText={
                    erroresFormulario.password ||
                    'Mínimo 6 caracteres.'
                  }
                  disabled={
                    guardando
                  }
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() =>
                            setMostrarPassword(
                              (
                                actual,
                              ) =>
                                !actual,
                            )
                          }
                          disabled={
                            guardando
                          }
                        >
                          {mostrarPassword ? (
                            <VisibilityOffOutlined />
                          ) : (
                            <VisibilityOutlined />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              <TextField
                fullWidth
                label="Teléfono"
                value={
                  formulario.telefono
                }
                onChange={(
                  event,
                ) =>
                  actualizarCampo(
                    'telefono',
                    event
                      .target
                      .value,
                  )
                }
                error={Boolean(
                  erroresFormulario.telefono,
                )}
                helperText={
                  erroresFormulario.telefono
                }
                disabled={
                  guardando
                }
                inputProps={{
                  maxLength:
                    25,
                }}
              />

              {modoFormulario ===
                'crear' && (
                <FormControl
                  fullWidth
                  error={Boolean(
                    erroresFormulario.rolId,
                  )}
                >
                  <InputLabel>
                    Rol administrativo
                  </InputLabel>

                  <Select
                    value={
                      formulario.rolId
                    }
                    label="Rol administrativo"
                    onChange={(
                      event,
                    ) =>
                      actualizarCampo(
                        'rolId',
                        event
                          .target
                          .value,
                      )
                    }
                    disabled={
                      guardando
                    }
                  >
                    <MenuItem value="3">
                      Administrador
                    </MenuItem>

                    <MenuItem value="4">
                      Administrador Principal
                    </MenuItem>
                  </Select>

                  {erroresFormulario.rolId && (
                    <Typography
                      sx={{
                        color:
                          '#D92D20',
                        fontSize:
                          12,
                        mt: 0.5,
                        ml: 1.7,
                      }}
                    >
                      {
                        erroresFormulario.rolId
                      }
                    </Typography>
                  )}
                </FormControl>
              )}

              {modoFormulario ===
                'editar' && (
                <Alert severity="info">
                  Por seguridad, desde esta edición solamente se actualizan nombre, correo electrónico y teléfono.
                </Alert>
              )}
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              p: 2,
            }}
          >
            <Button
              type="button"
              onClick={
                cerrarFormulario
              }
              disabled={
                guardando
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
              type="submit"
              variant="contained"
              disabled={
                guardando
              }
              sx={{
                minWidth: 130,
                minHeight: 42,
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
              {guardando ? (
                <CircularProgress
                  size={21}
                  sx={{
                    color:
                      '#FFFFFF',
                  }}
                />
              ) : modoFormulario ===
                'crear' ? (
                'Crear cuenta'
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={
          confirmacionEstadoAbierta
        }
        onClose={
          cerrarConfirmacionEstado
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          {administradorSeleccionado
            ?.estado ===
          'Activo'
            ? 'Desactivar cuenta'
            : 'Activar cuenta'}
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Alert
            severity={
              administradorSeleccionado
                ?.estado ===
              'Activo'
                ? 'warning'
                : 'info'
            }
          >
            {administradorSeleccionado
              ?.estado ===
            'Activo'
              ? `¿Desea desactivar la cuenta de ${administradorSeleccionado?.nombre}? El usuario dejará de poder ingresar al Portal Administrativo.`
              : `¿Desea activar nuevamente la cuenta de ${administradorSeleccionado?.nombre}?`}
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={
              cerrarConfirmacionEstado
            }
            disabled={
              procesando
            }
            sx={{
              textTransform:
                'none',
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color={
              administradorSeleccionado
                ?.estado ===
              'Activo'
                ? 'warning'
                : 'success'
            }
            onClick={
              confirmarCambioEstado
            }
            disabled={
              procesando
            }
            sx={{
              minWidth: 110,
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
            ) : administradorSeleccionado
                ?.estado ===
              'Activo' ? (
              'Desactivar'
            ) : (
              'Activar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={
          confirmacionEliminarAbierta
        }
        onClose={
          cerrarConfirmacionEliminar
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color:
              '#B42318',
          }}
        >
          Eliminar cuenta
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Alert severity="error">
            Esta acción eliminará permanentemente la cuenta administrativa de{' '}
            <strong>
              {
                administradorSeleccionado?.nombre
              }
            </strong>
            . Esta operación requiere confirmación y no puede deshacerse.
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={
              cerrarConfirmacionEliminar
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
            color="error"
            onClick={
              confirmarEliminar
            }
            disabled={
              procesando
            }
            startIcon={
              procesando
                ? null
                : (
                  <DeleteOutlineOutlined />
                )
            }
            sx={{
              minWidth: 120,
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
            ) : (
              'Eliminar'
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