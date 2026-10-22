import { Button } from '@mui/material'

export default function SingleRowAction({ label, icon, onClick, disabled, destructive = false }) {
  return <Button variant="outlined" size="small" aria-label={label} startIcon={icon} disabled={disabled} color={destructive ? 'error' : 'primary'} onClick={onClick} sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap', borderRadius: 2, minHeight: 34, px: 1.5, '&:hover': { bgcolor: destructive ? '#FEF3F2' : '#F0FDFA' } }}>{label}</Button>
}
