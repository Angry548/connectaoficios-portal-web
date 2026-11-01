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
    // Restore the existing session once on mount; preserve authentication behavior.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const actualizarDatosPersonales = useCallback((datos) => {
    const actualizado = authService.actualizarDatosPersonales(datos)
    if (actualizado) setUsuario(actualizado)
  }, [])

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      autenticado: Boolean(usuario),
      iniciarSesion,
      cerrarSesion,
      actualizarDatosPersonales,
    }),
    [
      usuario,
      cargando,
      iniciarSesion,
      cerrarSesion,
      actualizarDatosPersonales,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// The existing context and hook intentionally share a module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider.',
    )
  }

  return context
}
