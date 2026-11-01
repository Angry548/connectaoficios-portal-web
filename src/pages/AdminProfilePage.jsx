import { useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import UserAvatar from '../components/UserAvatar'
import AdminPageHeader from '../components/AdminPageHeader'
import { obtenerMiUsuario, obtenerMiPerfil, subirFoto, guardarFoto, guardarMisDatos } from '../services/adminProfileService'
import { notificarFotoActualizada } from '../services/avatarService'
import obtenerMensajeError from '../utils/getApiErrorMessage'

export default function AdminProfilePage() {
  const { usuario, actualizarDatosPersonales } = useAuth()
  const [formulario, setFormulario] = useState(() => ({ nombre: usuario.nombre || '', correo: usuario.correo || '', telefono: usuario.telefono || '' }))
  const [errores, setErrores] = useState({})
  const [guardandoDatos, setGuardandoDatos] = useState(false)
  const [errorDatos, setErrorDatos] = useState('')
  const [exito, setExito] = useState(false)
  const enviandoDatos = useRef(false)
  const [datos, setDatos] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [listo, setListo] = useState(false)
  const [revision, setRevision] = useState(0)
  const [archivo, setArchivo] = useState(null)
  const [pendiente, setPendiente] = useState('')
  const [preview, setPreview] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    let activo = true
    Promise.allSettled([obtenerMiUsuario(usuario.id), obtenerMiPerfil(usuario.id)]).then(([identidad, foto]) => {
      if (!activo) return
      if (identidad.status === 'fulfilled') {
        setDatos(identidad.value)
        setFormulario({ nombre: identidad.value.nombre || '', correo: identidad.value.correo || '', telefono: identidad.value.telefono || '' })
      }
      else setAviso('No se pudo actualizar la información de la cuenta. Se muestran los datos de la sesión.')
      if (foto.status === 'fulfilled') { setPerfil(foto.value); setListo(true); setError('') }
      else { setListo(false); setError(obtenerMensajeError(foto.reason)) }
      setCargando(false)
    })
    return () => { activo = false }
  }, [usuario.id, revision])

  useEffect(() => {
    if (!archivo) return undefined
    const url = URL.createObjectURL(archivo)
    // The selected file owns this temporary browser URL until replacement/unmount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  function seleccionar(event) {
    const foto = event.target.files?.[0]
    event.target.value = ''
    if (!foto) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(foto.type) || !foto.size || foto.size > 5 * 1024 * 1024) {
      setError('Selecciona una imagen JPEG, PNG o WEBP de hasta 5 MB.')
      return
    }
    setArchivo(foto); setPendiente(''); setError(''); setMensaje('')
  }

  async function guardar() {
    if (!archivo || !listo || guardando) return
    setGuardando(true); setError(''); setMensaje('')
    try {
      const fotoUrl = pendiente || await subirFoto(archivo)
      setPendiente(fotoUrl)
      const actualizado = await guardarFoto(fotoUrl, Boolean(perfil))
      setPerfil(actualizado); setArchivo(null); setPreview(''); setPendiente('')
      setMensaje('Fotografía guardada correctamente.')
      notificarFotoActualizada()
    } catch (err) { setError(obtenerMensajeError(err)) }
    finally { setGuardando(false) }
  }

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }))
    setErrores((actual) => ({ ...actual, [campo]: '' }))
    setErrorDatos('')
  }

  async function guardarDatos(event) {
    event.preventDefault()
    if (enviandoDatos.current || cargando) return
    const nuevos = {}
    const { nombre, correo, telefono } = formulario
    if (!nombre.trim()) nuevos.nombre = 'El nombre es obligatorio.'
    else if (nombre.trim().length > 100) nuevos.nombre = 'El nombre no puede superar los 100 caracteres.'
    if (!correo.trim()) nuevos.correo = 'El correo electrónico es obligatorio.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) nuevos.correo = 'Ingrese un correo electrónico válido.'
    else if (correo.trim().length > 150) nuevos.correo = 'El correo no puede superar los 150 caracteres.'
    if (telefono.trim().length > 25) nuevos.telefono = 'El teléfono no puede superar los 25 caracteres.'
    setErrores(nuevos)
    setErrorDatos(''); setExito(false)
    if (Object.keys(nuevos).length) return
    enviandoDatos.current = true
    setGuardandoDatos(true)
    try {
      const actualizado = await guardarMisDatos(formulario)
      actualizarDatosPersonales(actualizado)
      setDatos(actualizado)
      setFormulario({ nombre: actualizado.nombre, correo: actualizado.correo, telefono: actualizado.telefono || '' })
      setExito(true)
    } catch (err) {
      setErrorDatos(err.response?.status === 409 ? 'Este correo electrónico ya está registrado.' : obtenerMensajeError(err))
    } finally {
      enviandoDatos.current = false
      setGuardandoDatos(false)
    }
  }

  const identidad = datos || usuario
  return <Box>
    <AdminPageHeader title="Mi perfil" description="Actualiza tus datos personales y tu fotografía." />
    {aviso && <Alert severity="warning" sx={{ mb: 2 }}>{aviso}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }} action={!listo && <Button disabled={guardando} onClick={() => { setCargando(true); setRevision((n) => n + 1) }}>Reintentar</Button>}>{error}</Alert>}
    {mensaje && <Alert severity="success" sx={{ mb: 2 }}>{mensaje}</Alert>}
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid #EAECF0', borderRadius: 3, p: { xs: 2, sm: 3 }, maxWidth: 800 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <UserAvatar nombre={identidad.nombre} fotoUrl={archivo ? preview : perfil?.fotoUrl} size={88} />
        <Box>
          <Typography fontWeight={700}>{identidad.nombre}</Typography>
          <Typography variant="body2" color="text.secondary">JPEG, PNG o WEBP · Hasta 5 MB</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button component="label" variant="outlined" disabled={cargando || guardando || !listo}>
              Seleccionar fotografía<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={seleccionar} />
            </Button>
            <Button variant="contained" disabled={!archivo || !listo || guardando} onClick={guardar}>
              {guardando ? 'Guardando…' : 'Guardar fotografía'}
            </Button>
          </Stack>
          {archivo && <Typography variant="caption">{archivo.name}</Typography>}
        </Box>
      </Stack>
      {cargando && <CircularProgress size={24} aria-label="Cargando perfil" />}
      <Box component="form" noValidate onSubmit={guardarDatos}>
        {errorDatos && <Alert severity="error" sx={{ mb: 2 }}>{errorDatos}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {[['nombre', 'Nombre', 'text', 'name'], ['correo', 'Correo electrónico', 'email', 'email'], ['telefono', 'Teléfono', 'tel', 'tel']].map(([campo, label, type, autoComplete]) =>
            <TextField key={campo} label={label} type={type} autoComplete={autoComplete} required={campo !== 'telefono'}
              value={formulario[campo]} onChange={(event) => cambiar(campo, event.target.value)}
              disabled={cargando || guardandoDatos} error={Boolean(errores[campo])} helperText={errores[campo]} />)}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button type="submit" variant="contained" disabled={cargando || guardandoDatos}
            startIcon={guardandoDatos ? <CircularProgress size={18} color="inherit" /> : null}>
            {guardandoDatos ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </Box>
      </Box>
    </Box>
    <Snackbar open={exito} autoHideDuration={6000} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert severity="success" variant="filled" onClose={() => setExito(false)}>Perfil actualizado correctamente.</Alert>
    </Snackbar>
  </Box>
}
