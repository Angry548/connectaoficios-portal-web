import { Box } from '@mui/material'
import UserAvatar from './UserAvatar'

export default function UserIdentity({ nombre, fotoUrl, children }) {
  return <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, minWidth: 0, maxWidth: '100%' }}>
    <UserAvatar nombre={nombre} fotoUrl={fotoUrl} />
    <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{children ?? nombre ?? 'Usuario'}</Box>
  </Box>
}
