import { useState } from 'react'
import { PersonOutlined } from '@mui/icons-material'
import { Avatar } from '@mui/material'
import { iniciales } from '../utils/avatars'

export default function UserAvatar({ nombre, fotoUrl, size = 38, sx }) {
  const [failedUrl, setFailedUrl] = useState(null)
  const src = fotoUrl && failedUrl !== fotoUrl ? fotoUrl : undefined
  return <Avatar component="span" key={fotoUrl || 'sin-foto'} src={src} slotProps={{ img: { onError: () => setFailedUrl(fotoUrl) } }} alt={nombre || 'Usuario'}
    sx={{ width: size, height: size, flexShrink: 0, bgcolor: '#F0FDFA', color: '#0D9488', fontWeight: 700, fontSize: size < 48 ? 14 : 24, ...sx }}>
    {iniciales(nombre) || <PersonOutlined fontSize="inherit" />}
  </Avatar>
}
