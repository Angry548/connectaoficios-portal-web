import { Alert, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import AdminDialog from './AdminDialog'

export default function ConfirmActionDialog({ open, title, children, busy, error, onClose, onConfirm, confirmLabel, color = 'primary' }) {
  return <AdminDialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
    <DialogTitle>{title}</DialogTitle>
    <DialogContent><Typography component="div" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{children}</Typography>{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}</DialogContent>
    <DialogActions><Button variant="outlined" disabled={busy} onClick={onClose}>Cancelar</Button><Button variant="contained" color={color} disabled={busy} onClick={onConfirm} startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}>{busy ? 'Procesando…' : confirmLabel}</Button></DialogActions>
  </AdminDialog>
}
