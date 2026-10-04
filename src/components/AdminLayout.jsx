import { useState } from 'react'

import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'

import {
  AdminPanelSettingsOutlined,
  DashboardOutlined,
  LogoutOutlined,
  Menu as MenuIcon,
  PeopleAltOutlined,
  SettingsOutlined,
} from '@mui/icons-material'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

const drawerWidth = 260

export default function AdminLayout() {
  const navigate = useNavigate()

  const {
    usuario,
    cerrarSesion,
  } = useAuth()

  const [mobileOpen, setMobileOpen] =
    useState(false)

  const [anchorEl, setAnchorEl] =
    useState(null)

  const menuAbierto = Boolean(anchorEl)

  const alternarDrawer = () => {
    setMobileOpen((actual) => !actual)
  }

  const abrirMenuUsuario = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const cerrarMenuUsuario = () => {
    setAnchorEl(null)
  }

  const irCambiarPassword = () => {
    cerrarMenuUsuario()
    navigate('/cambiar-contrasena')
  }

  const salir = () => {
    cerrarMenuUsuario()
    cerrarSesion()

    navigate('/login', {
      replace: true,
    })
  }

  const obtenerIniciales = () => {
    const nombre = usuario?.nombre?.trim()

    if (!nombre) {
      return 'A'
    }

    const partes = nombre
      .split(' ')
      .filter(Boolean)

    if (partes.length === 1) {
      return partes[0]
        .substring(0, 2)
        .toUpperCase()
    }

    return `${partes[0][0]}${partes[1][0]}`
      .toUpperCase()
  }

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* LOGO */}
      <Box
        sx={{
          px: 3,
          height: 76,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            backgroundColor: '#0D9488',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AdminPanelSettingsOutlined />
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 18,
              color: '#101828',
              lineHeight: 1.1,
            }}
          >
            ConnectaOficios
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: '#667085',
              mt: 0.4,
            }}
          >
            Portal administrativo
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* MENÚ PRINCIPAL */}
      <List
        sx={{
          px: 1.5,
          py: 2,
        }}
      >
        {/* INICIO */}
        <ListItemButton
          component={NavLink}
          to="/dashboard"
          onClick={() =>
            setMobileOpen(false)
          }
          sx={{
            borderRadius: 2,
            mb: 0.5,
            color: '#475467',

            '&.active': {
              backgroundColor: '#F0FDFA',
              color: '#0D9488',
            },

            '&.active .MuiListItemIcon-root': {
              color: '#0D9488',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 42,
              color: 'inherit',
            }}
          >
            <DashboardOutlined />
          </ListItemIcon>

          <ListItemText
            primary="Inicio"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 600,
            }}
          />
        </ListItemButton>

        {/* USUARIOS */}
        <ListItemButton
          disabled
          sx={{
            borderRadius: 2,
            mb: 0.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 42,
            }}
          >
            <PeopleAltOutlined />
          </ListItemIcon>

          <ListItemText
            primary="Usuarios"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 600,
            }}
          />
        </ListItemButton>

        {/* ADMINISTRADORES */}
        <ListItemButton
          disabled
          sx={{
            borderRadius: 2,
            mb: 0.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 42,
            }}
          >
            <AdminPanelSettingsOutlined />
          </ListItemIcon>

          <ListItemText
            primary="Administradores"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 600,
            }}
          />
        </ListItemButton>
      </List>

      <Box sx={{ flex: 1 }} />

      {/* INFORMACIÓN DE CUENTA */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            borderRadius: 2.5,
            backgroundColor: '#F8FAFC',
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: '#344054',
            }}
          >
            {usuario?.rol}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: '#667085',
              mt: 0.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* SIDEBAR */}
      <Box
        component="nav"
        sx={{
          width: {
            md: drawerWidth,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        {/* SIDEBAR MÓVIL */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={alternarDrawer}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: 'block',
              md: 'none',
            },

            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* SIDEBAR ESCRITORIO */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },

            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight:
                '1px solid #EAECF0',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* CONTENIDO DERECHO */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* HEADER */}
        <Box
          component="header"
          sx={{
            height: 76,
            px: {
              xs: 2,
              sm: 3,
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            backgroundColor: '#FFFFFF',
            borderBottom:
              '1px solid #EAECF0',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
          }}
        >
          {/* PARTE IZQUIERDA */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <IconButton
              onClick={alternarDrawer}
              sx={{
                display: {
                  md: 'none',
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              sx={{
                fontWeight: 700,
                color: '#101828',
                fontSize: {
                  xs: 16,
                  sm: 18,
                },
              }}
            >
              Administración
            </Typography>
          </Box>

          {/* PARTE DERECHA */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: {
                  xs: 'none',
                  sm: 'block',
                },
                textAlign: 'right',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#344054',
                }}
              >
                {usuario?.nombre}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: '#667085',
                }}
              >
                {usuario?.rol}
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
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    backgroundColor:
                      '#0D9488',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {obtenerIniciales()}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* MENÚ USUARIO */}
            <Menu
              anchorEl={anchorEl}
              open={menuAbierto}
              onClose={cerrarMenuUsuario}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                onClick={
                  irCambiarPassword
                }
              >
                <ListItemIcon>
                  <SettingsOutlined fontSize="small" />
                </ListItemIcon>

                Cambiar contraseña
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={salir}
              >
                <ListItemIcon>
                  <LogoutOutlined fontSize="small" />
                </ListItemIcon>

                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* CONTENIDO DE LAS PÁGINAS */}
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