import BrandLogo from './BrandLogo'
import UserAvatar from './UserAvatar'
import useUserAvatars from '../hooks/useUserAvatars'
import {
  useState,
} from 'react'

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'

import {
  AdminPanelSettingsOutlined,
  AssessmentOutlined,
  DashboardOutlined,
  FlagOutlined,
  LogoutOutlined,
  Menu as MenuIcon,
  PeopleAltOutlined,
  LocalOfferOutlined,
  SettingsOutlined,
} from '@mui/icons-material'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

const drawerWidth = 260

const estiloOpcion = {
  borderRadius: 2,
  mb: 0.5,
  minHeight: 48,
  color: '#475467',
  px: 2,

  '&.active': {
    backgroundColor:
      '#F0FDFA',
    color:
      '#0D9488',
  },

  '&.active .MuiListItemIcon-root':
    {
      color:
        '#0D9488',
    },

  '&:hover': {
    backgroundColor:
      '#F8FAFC',
  },
}

const OpcionMenu = ({
    to,
    icono,
    texto,
    onClose,
  }) => (
    <ListItemButton
      component={NavLink}
      to={to}
      onClick={
        onClose
      }
      sx={
        estiloOpcion
      }
    >
      <ListItemIcon
        sx={{
          minWidth: 42,
          color:
            'inherit',
        }}
      >
        {icono}
      </ListItemIcon>

      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {texto}
      </Typography>
    </ListItemButton>
  )


export default function AdminLayout() {
  const navigate =
    useNavigate()

  const {
    usuario,
    cerrarSesion,
  } = useAuth()

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false)

  const [
    anchorEl,
    setAnchorEl,
  ] = useState(null)

  const menuAbierto =
    Boolean(anchorEl)

  const esAdministradorPrincipal =
    usuario?.rol ===
    'AdministradorPrincipal'

  const alternarDrawer = () => {
    setMobileOpen(
      (actual) =>
        !actual,
    )
  }

  const cerrarDrawerMovil =
    () => {
      setMobileOpen(false)
    }

  const abrirMenuUsuario = (
    event,
  ) => {
    setAnchorEl(
      event.currentTarget,
    )
  }

  const cerrarMenuUsuario =
    () => {
      setAnchorEl(null)
    }

  const irCambiarPassword =
    () => {
      cerrarMenuUsuario()

      navigate(
        '/cambiar-contrasena',
      )
    }

  const salir = () => {
    cerrarMenuUsuario()

    cerrarSesion()

    navigate(
      '/login',
      {
        replace: true,
      },
    )
  }

  const avatars = useUserAvatars([usuario])

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection:
          'column',
        backgroundColor:
          '#FFFFFF',
      }}
    >
      <Box
        sx={{
          px: 3,
          height: 76,
          display: 'flex',
          alignItems:
            'center',
          gap: 1.5,
        }}
      >
        <BrandLogo />
      </Box>

      <Divider />

      <List
        sx={{
          px: 1.5,
          py: 2,
        }}
      >
        <OpcionMenu onClose={cerrarDrawerMovil}
          to="/dashboard"
          texto="Inicio"
          icono={
            <DashboardOutlined />
          }
        />

        <OpcionMenu onClose={cerrarDrawerMovil}
          to="/usuarios"
          texto="Usuarios"
          icono={
            <PeopleAltOutlined />
          }
        />

        <OpcionMenu onClose={cerrarDrawerMovil}
          to="/servicios"
          texto="Servicios"
          icono={
            <SettingsOutlined />
          }
        />

        {['Administrador', 'AdministradorPrincipal'].includes(usuario?.rol) && (
          <OpcionMenu onClose={cerrarDrawerMovil} to="/promociones" texto="Promociones" icono={<LocalOfferOutlined />} />
        )}

        <OpcionMenu onClose={cerrarDrawerMovil}
          to="/reportes"
          texto="Reportes"
          icono={
            <FlagOutlined />
          }
        />

        <OpcionMenu onClose={cerrarDrawerMovil}
          to="/estadisticas"
          texto="Estadísticas"
          icono={
            <AssessmentOutlined />
          }
        />

        {esAdministradorPrincipal && (
          <OpcionMenu onClose={cerrarDrawerMovil}
            to="/administradores"
            texto="Administradores"
            icono={
              <AdminPanelSettingsOutlined />
            }
          />
        )}
      </List>

      <Box
        sx={{
          flex: 1,
        }}
      />

      <Box
        sx={{
          p: 2,
        }}
      >
        <Box
          sx={{
            borderRadius:
              2.5,
            backgroundColor:
              '#F8FAFC',
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color:
                '#344054',
            }}
          >
            {usuario?.rol ===
            'AdministradorPrincipal'
              ? 'Administrador Principal'
              : usuario?.rol}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color:
                '#667085',
              mt: 0.4,
              overflow:
                'hidden',
              textOverflow:
                'ellipsis',
            }}
          >
            {usuario?.correo}
          </Typography>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight:
          '100vh',
        backgroundColor:
          '#F8FAFC',
      }}
    >
      <Box
        component="nav"
        sx={{
          width: {
            md:
              drawerWidth,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={
            mobileOpen
          }
          onClose={
            alternarDrawer
          }
          ModalProps={{
            keepMounted:
              true,
          }}
          sx={{
            display: {
              xs: 'block',
              md: 'none',
            },

            '& .MuiDrawer-paper':
              {
                width:
                  drawerWidth,
                boxSizing:
                  'border-box',
              },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },

            '& .MuiDrawer-paper':
              {
                width:
                  drawerWidth,
                boxSizing:
                  'border-box',
                borderRight:
                  '1px solid #EAECF0',
              },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <Box
          component="header"
          sx={{
            height: 76,
            px: {
              xs: 2,
              sm: 3,
            },
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'space-between',
            backgroundColor:
              '#FFFFFF',
            borderBottom:
              '1px solid #EAECF0',
            position:
              'sticky',
            top: 0,
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems:
                'center',
              gap: 1.5,
            }}
          >
            <IconButton
              onClick={
                alternarDrawer
              }
              sx={{
                display: {
                  xs:
                    'inline-flex',
                  md:
                    'none',
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              sx={{
                fontSize: {
                  xs: 18,
                  sm: 20,
                },
                fontWeight: 800,
                color:
                  '#101828',
              }}
            >
              Administración
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems:
                'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                textAlign:
                  'right',
                display: {
                  xs: 'none',
                  sm: 'block',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    '#344054',
                }}
              >
                {usuario?.nombre}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color:
                    '#667085',
                }}
              >
                {usuario?.rol ===
                'AdministradorPrincipal'
                  ? 'Administrador Principal'
                  : usuario?.rol}
              </Typography>
            </Box>

            <Tooltip title="Cuenta">
              <IconButton
                onClick={
                  abrirMenuUsuario
                }
                sx={{
                  p: 0,
                }}
              >
                <UserAvatar nombre={usuario?.nombre} fotoUrl={avatars.fotoDe(usuario)} size={42} />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={
                anchorEl
              }
              open={
                menuAbierto
              }
              onClose={
                cerrarMenuUsuario
              }
              anchorOrigin={{
                vertical:
                  'bottom',
                horizontal:
                  'right',
              }}
              transformOrigin={{
                vertical:
                  'top',
                horizontal:
                  'right',
              }}
            >
              <MenuItem onClick={() => { cerrarMenuUsuario(); navigate('/mi-perfil') }}>Mi perfil</MenuItem>
              <MenuItem
                onClick={
                  irCambiarPassword
                }
              >
                <ListItemIcon>
                  <SettingsOutlined
                    fontSize="small"
                  />
                </ListItemIcon>

                Cambiar contraseña
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={
                  salir
                }
              >
                <ListItemIcon>
                  <LogoutOutlined
                    fontSize="small"
                  />
                </ListItemIcon>

                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Box
          component="main"
          sx={{
            p: {
              xs: 2,
              sm: 3,
              lg: 4,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
