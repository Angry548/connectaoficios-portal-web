import { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import UserAvatar from '../components/UserAvatar'
import AdminPageHeader from '../components/AdminPageHeader'
import { obtenerMiUsuario, obtenerMiPerfil, subirFoto, guardarFoto } from '../services/adminProfileService'
import { notificarFotoActualizada } from '../services/avatarService'
import obtenerMensajeError from '../utils/getApiErrorMessage'

export default function AdminProfilePage() {
  const { usuario } = useAuth()
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
      if (identidad.status === 'fulfilled') setDatos(identidad.value)
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

  const identidad = datos || usuario
  return <Box>
    <AdminPageHeader title="Mi perfil" description="Consulta tu cuenta y actualiza tu fotografía." />
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {[['Nombre', identidad.nombre], ['Correo', identidad.correo], ['Teléfono', identidad.telefono], ['Rol', identidad.rol], ['ID de usuario', identidad.id], ['Estado', identidad.estado]].map(([label, value]) =>
          <TextField key={label} label={label} value={value ?? ''} slotProps={{ input: { readOnly: true } }} />)}
      </Box>
    </Box>
  </Box>
}
