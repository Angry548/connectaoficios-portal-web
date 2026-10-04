import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import {
  ArrowBackOutlined,
  LockResetOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

export default function ChangePasswordPage() {
  const navigate = useNavigate()

  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] =
    useState('')

  const [mostrarActual, setMostrarActual] =
    useState(false)
  const [mostrarNueva, setMostrarNueva] =
    useState(false)
  const [
    mostrarConfirmacion,
    setMostrarConfirmacion,
  ] = useState(false)

  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const manejarSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setExito('')

    if (!actual || !nueva || !confirmacion) {
      setError(
        'Complete todos los campos.',
      )
      return
    }

    if (nueva.length < 6) {
      setError(
        'La nueva contraseña debe contener al menos 6 caracteres.',
      )
      return
    }

    if (nueva !== confirmacion) {
      setError(
        'La confirmación no coincide con la nueva contraseña.',
      )
      return
    }

    if (actual === nueva) {
      setError(
        'La nueva contraseña debe ser diferente de la contraseña actual.',
      )
      return
    }

    setEnviando(true)

    try {
      const respuesta =
        await authService.cambiarPassword(
          actual,
          nueva,
        )

      setActual('')
      setNueva('')
      setConfirmacion('')

      setExito(
        respuesta?.message ||
          'Contraseña actualizada correctamente.',
      )
    } catch (err) {
      if (err.response?.status === 400) {
        setError(
          err.response.data?.message ||
            'No fue posible cambiar la contraseña.',
        )
      } else if (err.response?.status === 403) {
        setError(
          'La cuenta no tiene permiso para realizar esta operación.',
        )
      } else {
        setError(
          err.response?.data?.message ||
            'No fue posible cambiar la contraseña.',
        )
      }
    } finally {
      setEnviando(false)
    }
  }

  const campoPassword = (
    label,
    value,
    setValue,
    visible,
    setVisible,
    autoComplete,
  ) => (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: '#344054',
          mb: 0.8,
        }}
      >
        {label}
      </Typography>

      <TextField
        fullWidth
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) =>
          setValue(event.target.value)
        }
        disabled={enviando}
        autoComplete={autoComplete}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() =>
                  setVisible((actual) => !actual)
                }
              >
                {visible ? (
                  <VisibilityOffOutlined />
                ) : (
                  <VisibilityOutlined />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )

  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: 'auto',
      }}
    >
      <Button
        startIcon={<ArrowBackOutlined />}
        onClick={() => navigate('/dashboard')}
        sx={{
          color: '#475467',
          textTransform: 'none',
          mb: 2,
        }}
      >
        Volver
      </Button>

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
        Cambiar contraseña
      </Typography>

      <Typography
        sx={{
          color: '#667085',
          fontSize: 15,
          mt: 0.8,
          mb: 3,
        }}
      >
        Actualiza la contraseña de tu cuenta
        administrativa.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #EAECF0',
          borderRadius: 4,
          p: {
            xs: 3,
            sm: 4,
          },
        }}
      >
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: 2.5,
            backgroundColor: '#F0FDFA',
            color: '#0D9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <LockResetOutlined />
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
          >
            {error}
          </Alert>
        )}

        {exito && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
            }}
          >
            {exito}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={manejarSubmit}
        >
          {campoPassword(
            'Contraseña actual',
            actual,
            setActual,
            mostrarActual,
            setMostrarActual,
            'current-password',
          )}

          {campoPassword(
            'Nueva contraseña',
            nueva,
            setNueva,
            mostrarNueva,
            setMostrarNueva,
            'new-password',
          )}

          {campoPassword(
            'Confirmar nueva contraseña',
            confirmacion,
            setConfirmacion,
            mostrarConfirmacion,
            setMostrarConfirmacion,
            'new-password',
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={enviando}
            sx={{
              mt: 1,
              minWidth: 190,
              minHeight: 46,
              borderRadius: 2,
              backgroundColor: '#0D9488',
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': {
                backgroundColor: '#0F766E',
                boxShadow: 'none',
              },
            }}
          >
            {enviando ? (
              <CircularProgress
                size={22}
                sx={{
                  color: '#FFFFFF',
                }}
              />
            ) : (
              'Guardar contraseña'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}