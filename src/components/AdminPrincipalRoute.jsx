import {
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material'

import {
  BlockOutlined,
} from '@mui/icons-material'

import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

export default function AdminPrincipalRoute() {
  const {
    usuario,
    autenticado,
    cargando,
  } = useAuth()

  const navigate =
    useNavigate()

  const location =
    useLocation()

  if (cargando) {
    return null
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    )
  }

  if (
    usuario?.rol !==
    'AdministradorPrincipal'
  ) {
    return (
      <Box
        sx={{
          minHeight:
            'calc(100vh - 150px)',
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'center',
          px: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 560,
            border:
              '1px solid #EAECF0',
            borderRadius: 4,
            p: {
              xs: 3,
              sm: 5,
            },
            textAlign:
              'center',
          }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              backgroundColor:
                '#FEF3F2',
              color:
                '#D92D20',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <BlockOutlined
              sx={{
                fontSize: 38,
              }}
            />
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: 22,
                sm: 27,
              },
              fontWeight: 800,
              color:
                '#101828',
            }}
          >
            Acceso no autorizado
          </Typography>

          <Typography
            sx={{
              color:
                '#667085',
              fontSize: 14,
              lineHeight: 1.7,
              mt: 1.2,
            }}
          >
            Este módulo está disponible únicamente para cuentas con rol de Administrador Principal.
          </Typography>

          <Button
            variant="contained"
            onClick={() =>
              navigate(
                '/dashboard',
                {
                  replace:
                    true,
                },
              )
            }
            sx={{
              mt: 3,
              minHeight: 44,
              borderRadius: 2,
              backgroundColor:
                '#0D9488',
              boxShadow: 'none',
              textTransform:
                'none',
              fontWeight: 700,
              '&:hover': {
                backgroundColor:
                  '#0F766E',
                boxShadow:
                  'none',
              },
            }}
          >
            Volver al inicio
          </Button>
        </Paper>
      </Box>
    )
  }

  return <Outlet />
}