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
  AdminPanelSettingsOutlined,
  LockOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'

import {
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()

  const {
    iniciarSesion,
    autenticado,
    cargando,
  } = useAuth()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false)

  const [enviando, setEnviando] =
    useState(false)

  const [errorGeneral, setErrorGeneral] =
    useState('')

  const [errores, setErrores] = useState({
    correo: '',
    password: '',
  })

  const validarCorreo = (valor) => {
    const expresion =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return expresion.test(valor)
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      correo: '',
      password: '',
    }

    const correoLimpio = correo.trim()

    if (!correoLimpio) {
      nuevosErrores.correo =
        'El correo electrónico es obligatorio.'
    } else if (!validarCorreo(correoLimpio)) {
      nuevosErrores.correo =
        'Ingrese un correo electrónico válido.'
    }

    if (!password) {
      nuevosErrores.password =
        'La contraseña es obligatoria.'
    } else if (password.length < 6) {
      nuevosErrores.password =
        'La contraseña debe contener al menos 6 caracteres.'
    }

    setErrores(nuevosErrores)

    return (
      !nuevosErrores.correo &&
      !nuevosErrores.password
    )
  }

  const manejarCambioCorreo = (event) => {
    const valor = event.target.value

    setCorreo(valor)

    if (errores.correo) {
      setErrores((actual) => ({
        ...actual,
        correo: '',
      }))
    }

    if (errorGeneral) {
      setErrorGeneral('')
    }
  }

  const manejarCambioPassword = (event) => {
    const valor = event.target.value

    setPassword(valor)

    if (errores.password) {
      setErrores((actual) => ({
        ...actual,
        password: '',
      }))
    }

    if (errorGeneral) {
      setErrorGeneral('')
    }
  }

  const manejarSubmit = async (event) => {
    event.preventDefault()

    setErrorGeneral('')

    if (!validarFormulario()) {
      return
    }

    setEnviando(true)

    try {
      await iniciarSesion(
        correo.trim(),
        password,
      )

      navigate('/dashboard', {
        replace: true,
      })
    } catch (err) {
      console.error(
        'Error al iniciar sesión:',
        err,
      )

      if (!err.response) {
        setErrorGeneral(
          'No fue posible conectar con el servidor. Verifique la conexión o la configuración CORS de la API.',
        )
      } else if (
        err.response.status === 400
      ) {
        setErrorGeneral(
          err.response.data?.message ||
            'Verifique los datos ingresados.',
        )
      } else if (
        err.response.status === 401
      ) {
        setErrorGeneral(
          err.response.data?.message ||
            'Correo o contraseña incorrectos.',
        )
      } else if (
        err.response.status === 403
      ) {
        setErrorGeneral(
          err.response.data?.message ||
            'Acceso no autorizado. Esta cuenta no posee permisos administrativos.',
        )
      } else {
        setErrorGeneral(
          err.response.data?.message ||
            'No fue posible iniciar sesión.',
        )
      }
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (autenticado) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          border: '1px solid #EAECF0',
          borderRadius: 4,
          p: {
            xs: 3,
            sm: 4,
          },
        }}
      >
        {/* ICONO */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            backgroundColor: '#F0FDFA',
            color: '#0D9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <AdminPanelSettingsOutlined
            sx={{
              fontSize: 34,
            }}
          />
        </Box>

        {/* TÍTULO */}
        <Typography
          component="h1"
          sx={{
            textAlign: 'center',
            fontSize: {
              xs: 25,
              sm: 28,
            },
            fontWeight: 800,
            color: '#101828',
          }}
        >
          ConnectaOficios
        </Typography>

        <Typography
          sx={{
            textAlign: 'center',
            color: '#667085',
            fontSize: 14,
            mt: 0.8,
          }}
        >
          Portal de administración
        </Typography>

        {/* FORMULARIO */}
        <Box
          component="form"
          onSubmit={manejarSubmit}
          noValidate
          sx={{
            mt: 4,
          }}
        >
          {/* ERROR GENERAL */}
          {errorGeneral && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 2,
              }}
            >
              {errorGeneral}
            </Alert>
          )}

          {/* CORREO */}
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: '#344054',
              mb: 0.8,
            }}
          >
            Correo electrónico
          </Typography>

          <TextField
            fullWidth
            type="email"
            value={correo}
            onChange={manejarCambioCorreo}
            placeholder="administrador@correo.com"
            autoComplete="email"
            disabled={enviando}
            error={Boolean(errores.correo)}
            helperText={errores.correo}
            sx={{
              mb: 2.5,
            }}
          />

          {/* CONTRASEÑA */}
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: '#344054',
              mb: 0.8,
            }}
          >
            Contraseña
          </Typography>

          <TextField
            fullWidth
            type={
              mostrarPassword
                ? 'text'
                : 'password'
            }
            value={password}
            onChange={
              manejarCambioPassword
            }
            placeholder="Ingrese su contraseña"
            autoComplete="current-password"
            disabled={enviando}
            error={Boolean(
              errores.password,
            )}
            helperText={errores.password}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined
                      sx={{
                        color: '#98A2B3',
                      }}
                    />
                  </InputAdornment>
                ),

                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      disabled={enviando}
                      onClick={() =>
                        setMostrarPassword(
                          (actual) =>
                            !actual,
                        )
                      }
                      onMouseDown={(
                        event,
                      ) => {
                        event.preventDefault()
                      }}
                      aria-label={
                        mostrarPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
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
              },
            }}
          />

          {/* BOTÓN LOGIN */}
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={enviando}
            sx={{
              mt: 3,
              minHeight: 50,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 15,
              backgroundColor: '#0D9488',
              boxShadow: 'none',

              '&:hover': {
                backgroundColor: '#0F766E',
                boxShadow: 'none',
              },
            }}
          >
            {enviando ? (
              <CircularProgress
                size={23}
                sx={{
                  color: '#FFFFFF',
                }}
              />
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </Box>

        <Typography
          sx={{
            textAlign: 'center',
            color: '#98A2B3',
            fontSize: 12,
            mt: 3,
          }}
        >
          Acceso exclusivo para personal
          administrativo
        </Typography>
      </Paper>
    </Box>
  )
}