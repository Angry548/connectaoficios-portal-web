import {
  Box,
  Paper,
  Typography,
} from '@mui/material'
import {
  AdminPanelSettingsOutlined,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

export default function DashboardPage() {
  const { usuario } = useAuth()

  return (
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
        Bienvenido, {usuario?.nombre}
      </Typography>

      <Typography
        sx={{
          color: '#667085',
          fontSize: 15,
          mt: 0.8,
        }}
      >
        Portal administrativo de ConnectaOficios
      </Typography>

      <Paper
        elevation={0}
        sx={{
          mt: 4,
          border: '1px solid #EAECF0',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            minHeight: 380,
            px: {
              xs: 3,
              sm: 5,
            },
            py: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 86,
              height: 86,
              borderRadius: '50%',
              backgroundColor: '#F0FDFA',
              color: '#0D9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <AdminPanelSettingsOutlined
              sx={{
                fontSize: 44,
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: {
                xs: 22,
                sm: 26,
              },
              fontWeight: 800,
              color: '#101828',
            }}
          >
            Bienvenido a ConnectaOficios
          </Typography>

          <Typography
            sx={{
              color: '#667085',
              maxWidth: 580,
              fontSize: 15,
              lineHeight: 1.7,
              mt: 1.5,
            }}
          >
            Has iniciado sesión correctamente en el
            portal administrativo.
          </Typography>

          <Box
            sx={{
              mt: 3,
              px: 2.5,
              py: 1.2,
              borderRadius: 10,
              backgroundColor: '#F0FDFA',
            }}
          >
            <Typography
              sx={{
                color: '#0F766E',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {usuario?.rol}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}