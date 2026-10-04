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
  InputLabel,
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
  Typography,
} from '@mui/material'

import {
  PeopleAltOutlined,
} from '@mui/icons-material'

import adminUsersService from '../../services/adminUsersService'

const obtenerMensajeError = (error) => {
  if (!error.response) {
    return 'No fue posible conectar con el servidor.'
  }

  if (error.response.status === 401) {
    return 'La sesión ha expirado. Inicie sesión nuevamente.'
  }

  if (error.response.status === 403) {
    return 'No tiene permisos para realizar esta operación.'
  }

  if (error.response.status === 404) {
    return (
      error.response.data?.message ||
      'El usuario solicitado no existe.'
    )
  }

  return (
    error.response.data?.message ||
    'Ocurrió un error al procesar la solicitud.'
  )
}

const obtenerColorEstado = (estado) => {
  if (estado === 'Activo') {
    return 'success'
  }

  return 'default'
}

const formatearFecha = (fecha) => {
  if (!fecha) {
    return 'No disponible'
  }

  const valor = new Date(fecha)

  if (Number.isNaN(valor.getTime())) {
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

export default function UsersPage() {
  const [usuarios, setUsuarios] =
    useState([])

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const [nombre, setNombre] =
    useState('')

  const [correo, setCorreo] =
    useState('')

  const [rolId, setRolId] =
    useState('')

  const [estado, setEstado] =
    useState('')

  const [filtros, setFiltros] =
    useState({
      nombre: '',
      correo: '',
      rolId: '',
      estado: '',
    })

  const [pagina, setPagina] =
    useState(1)

  const [tamanoPagina, setTamanoPagina] =
    useState(10)

  const [totalItems, setTotalItems] =
    useState(0)

  const [
    usuarioDetalle,
    setUsuarioDetalle,
  ] = useState(null)

  const [
    detalleAbierto,
    setDetalleAbierto,
  ] = useState(false)

  const [
    cargandoDetalle,
    setCargandoDetalle,
  ] = useState(false)

  const [
    usuarioCambioEstado,
    setUsuarioCambioEstado,
  ] = useState(null)

  const [
    confirmacionAbierta,
    setConfirmacionAbierta,
  ] = useState(false)

  const [
    cambiandoEstado,
    setCambiandoEstado,
  ] = useState(false)

  const [mensaje, setMensaje] =
    useState('')

  const cargarUsuarios =
    useCallback(async () => {
      setCargando(true)
      setError('')

      try {
        const respuesta =
          await adminUsersService
            .obtenerUsuarios({
              ...filtros,
              page: pagina,
              pageSize: tamanoPagina,
            })

        setUsuarios(
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
        setUsuarios([])
        setTotalItems(0)

        setError(
          obtenerMensajeError(err),
        )
      } finally {
        setCargando(false)
      }
    }, [
      filtros,
      pagina,
      tamanoPagina,
    ])

  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  const aplicarFiltros = (
    event,
  ) => {
    event.preventDefault()

    setPagina(1)

    setFiltros({
      nombre: nombre.trim(),
      correo: correo.trim(),
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

  const abrirDetalle = async (
    usuario,
  ) => {
    setDetalleAbierto(true)
    setCargandoDetalle(true)
    setUsuarioDetalle(null)

    try {
      const respuesta =
        await adminUsersService
          .obtenerUsuarioPorId(
            usuario.id,
          )

      setUsuarioDetalle(
        respuesta,
      )
    } catch (err) {
      setDetalleAbierto(false)

      setError(
        obtenerMensajeError(err),
      )
    } finally {
      setCargandoDetalle(false)
    }
  }

  const cerrarDetalle = () => {
    if (cargandoDetalle) {
      return
    }

    setDetalleAbierto(false)
    setUsuarioDetalle(null)
  }

  const solicitarCambioEstado = (
    usuario,
  ) => {
    setUsuarioCambioEstado(usuario)
    setConfirmacionAbierta(true)
  }

  const cerrarConfirmacion = () => {
    if (cambiandoEstado) {
      return
    }

    setConfirmacionAbierta(false)
    setUsuarioCambioEstado(null)
  }

  const confirmarCambioEstado =
    async () => {
      if (!usuarioCambioEstado) {
        return
      }

      const nuevoEstado =
        usuarioCambioEstado.estado ===
        'Activo'
          ? 2
          : 1

      setCambiandoEstado(true)

      try {
        const actualizado =
          await adminUsersService
            .cambiarEstado(
              usuarioCambioEstado.id,
              nuevoEstado,
            )

        setMensaje(
          nuevoEstado === 1
            ? 'Usuario activado correctamente.'
            : 'Usuario desactivado correctamente.',
        )

        setConfirmacionAbierta(false)
        setUsuarioCambioEstado(null)

        setUsuarios((actuales) =>
          actuales.map((usuario) =>
            usuario.id ===
            actualizado.id
              ? actualizado
              : usuario,
          ),
        )
      } catch (err) {
        setError(
          obtenerMensajeError(err),
        )
      } finally {
        setCambiandoEstado(false)
      }
    }

  const cambiarPagina = (
    event,
    nuevaPagina,
  ) => {
    setPagina(nuevaPagina + 1)
  }

  const cambiarTamanoPagina = (
    event,
  ) => {
    setTamanoPagina(
      Number(event.target.value),
    )

    setPagina(1)
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
            Gestión de usuarios
          </Typography>

          <Typography
            sx={{
              color: '#667085',
              fontSize: 15,
              mt: 0.7,
            }}
          >
            Consulta y administra las
            cuentas de clientes y
            trabajadores registrados.
          </Typography>
        </Box>

        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            backgroundColor:
              '#F0FDFA',
            color: '#0D9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PeopleAltOutlined />
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
          onSubmit={aplicarFiltros}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
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
              onChange={(event) =>
                setNombre(
                  event.target.value,
                )
              }
              placeholder="Buscar por nombre"
              fullWidth
            />

            <TextField
              label="Correo electrónico"
              value={correo}
              onChange={(event) =>
                setCorreo(
                  event.target.value,
                )
              }
              placeholder="Buscar por correo"
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>
                Rol
              </InputLabel>

              <Select
                value={rolId}
                label="Rol"
                onChange={(event) =>
                  setRolId(
                    event.target.value,
                  )
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>

                <MenuItem value="1">
                  Cliente
                </MenuItem>

                <MenuItem value="2">
                  Trabajador
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>
                Estado
              </InputLabel>

              <Select
                value={estado}
                label="Estado"
                onChange={(event) =>
                  setEstado(
                    event.target.value,
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
                textTransform: 'none',
                fontWeight: 700,
                backgroundColor:
                  '#0D9488',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor:
                    '#0F766E',
                  boxShadow: 'none',
                },
              }}
            >
              Aplicar filtros
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={limpiarFiltros}
              disabled={cargando}
              sx={{
                minWidth: 130,
                minHeight: 44,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                borderColor:
                  '#D0D5DD',
                color: '#475467',
              }}
            >
              Limpiar
            </Button>

            <Button
              type="button"
              onClick={cargarUsuarios}
              disabled={cargando}
              sx={{
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 700,
                color: '#0D9488',
              }}
            >
              Actualizar
            </Button>
          </Stack>
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
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 700,
                color: '#101828',
              }}
            >
              Usuarios registrados
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: '#667085',
                mt: 0.4,
              }}
            >
              {totalItems}{' '}
              {totalItems === 1
                ? 'usuario encontrado'
                : 'usuarios encontrados'}
            </Typography>
          </Box>
        </Box>

        {cargando ? (
          <Box
            sx={{
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : usuarios.length === 0 ? (
          <Box
            sx={{
              minHeight: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'center',
              flexDirection:
                'column',
              textAlign: 'center',
              px: 3,
            }}
          >
            <PeopleAltOutlined
              sx={{
                fontSize: 48,
                color: '#98A2B3',
                mb: 1.5,
              }}
            />

            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 700,
                color: '#344054',
              }}
            >
              No se encontraron
              usuarios
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                color: '#667085',
                mt: 0.5,
              }}
            >
              Cambia los filtros e
              intenta nuevamente.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth: 850,
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
                        fontWeight: 700,
                        color:
                          '#475467',
                      }}
                    >
                      Nombre
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color:
                          '#475467',
                      }}
                    >
                      Correo
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color:
                          '#475467',
                      }}
                    >
                      Rol
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color:
                          '#475467',
                      }}
                    >
                      Estado
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: '#475467',
                        width: 230,
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {usuarios.map(
                    (usuario) => (
                      <TableRow
                        key={usuario.id}
                        hover
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              fontSize:
                                14,
                              fontWeight:
                                600,
                              color:
                                '#101828',
                            }}
                          >
                            {
                              usuario.nombre
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
                            {
                              usuario.correo
                            }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              usuario.rol
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight:
                                600,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              usuario.estado
                            }
                            size="small"
                            color={obtenerColorEstado(
                              usuario.estado,
                            )}
                            variant={
                              usuario.estado ===
                              'Activo'
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
                            width: 230,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Button
                              size="small"
                              onClick={() =>
                                abrirDetalle(
                                  usuario,
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
                                usuario.estado ===
                                'Activo'
                                  ? 'error'
                                  : 'success'
                              }
                              onClick={() =>
                                solicitarCambioEstado(
                                  usuario,
                                )
                              }
                              sx={{
                                textTransform:
                                  'none',
                                fontWeight:
                                  700,
                              }}
                            >
                              {usuario.estado ===
                              'Activo'
                                ? 'Desactivar'
                                : 'Activar'}
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalItems}
              page={pagina - 1}
              onPageChange={
                cambiarPagina
              }
              rowsPerPage={
                tamanoPagina
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
        open={detalleAbierto}
        onClose={cerrarDetalle}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: '#101828',
          }}
        >
          Detalle del usuario
        </DialogTitle>

        <DialogContent dividers>
          {cargandoDetalle ? (
            <Box
              sx={{
                minHeight: 220,
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
            usuarioDetalle && (
              <Stack
                spacing={2.5}
                sx={{
                  py: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color:
                        '#667085',
                      fontWeight:
                        600,
                    }}
                  >
                    Nombre
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 15,
                      fontWeight:
                        700,
                      color:
                        '#101828',
                    }}
                  >
                    {
                      usuarioDetalle.nombre
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color:
                        '#667085',
                      fontWeight:
                        600,
                    }}
                  >
                    Correo electrónico
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 15,
                      color:
                        '#344054',
                    }}
                  >
                    {
                      usuarioDetalle.correo
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color:
                        '#667085',
                      fontWeight:
                        600,
                    }}
                  >
                    Teléfono
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 15,
                      color:
                        '#344054',
                    }}
                  >
                    {usuarioDetalle.telefono ||
                      'No registrado'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color:
                        '#667085',
                      fontWeight:
                        600,
                    }}
                  >
                    Rol
                  </Typography>

                  <Box
                    sx={{
                      mt: 0.8,
                    }}
                  >
                    <Chip
                      label={
                        usuarioDetalle.rol
                      }
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color:
                        '#667085',
                      fontWeight:
                        600,
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
                        usuarioDetalle.estado
                      }
                      color={obtenerColorEstado(
                        usuarioDetalle.estado,
                      )}
                      variant={
                        usuarioDetalle.estado ===
                        'Activo'
                          ? 'filled'
                          : 'outlined'
                      }
                      size="small"
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color:
                        '#667085',
                      fontWeight:
                        600,
                    }}
                  >
                    Fecha de creación
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 15,
                      color:
                        '#344054',
                    }}
                  >
                    {formatearFecha(
                      usuarioDetalle
                        .fechaCreacion,
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
            onClick={cerrarDetalle}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: '#475467',
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmacionAbierta}
        onClose={
          cerrarConfirmacion
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: '#101828',
          }}
        >
          {usuarioCambioEstado?.estado ===
          'Activo'
            ? 'Desactivar usuario'
            : 'Activar usuario'}
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: '#475467',
              lineHeight: 1.7,
            }}
          >
            {usuarioCambioEstado?.estado ===
            'Activo'
              ? `¿Está seguro de que desea desactivar la cuenta de ${usuarioCambioEstado?.nombre}? El usuario dejará de tener acceso a las funcionalidades protegidas de la plataforma.`
              : `¿Está seguro de que desea activar nuevamente la cuenta de ${usuarioCambioEstado?.nombre}?`}
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
              textTransform: 'none',
              fontWeight: 700,
              color: '#475467',
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color={
              usuarioCambioEstado?.estado ===
              'Activo'
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
              minWidth: 120,
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
            }}
          >
            {cambiandoEstado ? (
              <CircularProgress
                size={20}
                sx={{
                  color: '#FFFFFF',
                }}
              />
            ) : usuarioCambioEstado?.estado ===
              'Activo' ? (
              'Desactivar'
            ) : (
              'Activar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(mensaje)}
        autoHideDuration={4000}
        onClose={() =>
          setMensaje('')
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
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