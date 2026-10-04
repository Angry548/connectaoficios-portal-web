import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargarSesion = useCallback(() => {
    const sesion = authService.obtenerSesion()

    if (sesion) {
      setUsuario(sesion.usuario)
    } else {
      setUsuario(null)
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    cargarSesion()
  }, [cargarSesion])

  useEffect(() => {
    const manejarSesionExpirada = () => {
      authService.cerrarSesion()
      setUsuario(null)
    }

    window.addEventListener(
      'admin-session-expired',
      manejarSesionExpirada,
    )

    return () => {
      window.removeEventListener(
        'admin-session-expired',
        manejarSesionExpirada,
      )
    }
  }, [])

  const iniciarSesion = useCallback(
    async (correo, password) => {
      const sesion = await authService.iniciarSesion(
        correo,
        password,
      )

      setUsuario(sesion.usuario)

      return sesion.usuario
    },
    [],
  )

  const cerrarSesion = useCallback(() => {
    authService.cerrarSesion()
    setUsuario(null)
  }, [])

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      autenticado: Boolean(usuario),
      iniciarSesion,
      cerrarSesion,
    }),
    [
      usuario,
      cargando,
      iniciarSesion,
      cerrarSesion,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider.',
    )
  }

  return context
}