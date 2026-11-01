import { Alert, Button } from '@mui/material'

export default function AvatarNotice({ avatars }) {
  return avatars.error ? <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={avatars.reintentar}>Reintentar</Button>}>
    No se pudieron cargar las fotografías. Se muestran las iniciales.
  </Alert> : null
}
