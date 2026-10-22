import { useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material'
import AdminDialog from '../../components/AdminDialog'
import ConfirmActionDialog from '../../components/ConfirmActionDialog'
import { validarFiltros } from './promotionUtils'
import { RefreshOutlined } from '@mui/icons-material'
import AdminFilterCard from '../../components/AdminFilterCard'
import AdminTableCard from '../../components/AdminTableCard'

export function PromotionFilters({ fields, onApply, disabled, onRefresh, refreshing }) {
  const [values, setValues] = useState({})
  const [error, setError] = useState('')
  const [reset, setReset] = useState(0)
  return <AdminFilterCard component="form" onSubmit={(event) => { event.preventDefault(); const message = validarFiltros(values); setError(message); if (!message) onApply(values) }}>
    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2.5 }}>Buscar y filtrar</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
      {fields.map(({ name, label, type = 'text', options, render }) => render ? <Box key={`${name}-${reset}`}>{render({ value: values[name] ?? '', onChange: (value) => setValues((current) => ({ ...current, [name]: value })), disabled })}</Box> : <TextField key={name} label={label} type={type} select={Boolean(options)} value={values[name] ?? ''} disabled={disabled} onChange={(event) => setValues({ ...values, [name]: event.target.value })} slotProps={{ inputLabel: type === 'datetime-local' ? { shrink: true } : {}, htmlInput: type === 'number' ? { min: name.startsWith('precio') ? 0 : 1, step: name.startsWith('precio') ? 'any' : 1 } : {} }}>
        {options?.map(([value, text]) => <MenuItem key={value} value={value}>{text}</MenuItem>)}
      </TextField>)}
    </Box>
    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    <Stack direction="row" useFlexGap spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}><Button variant="contained" type="submit" disabled={disabled}>Aplicar filtros</Button><Button variant="outlined" disabled={disabled} onClick={() => { setValues({}); setReset((value) => value + 1); setError(''); onApply({}) }}>Limpiar</Button><Button variant="outlined" startIcon={<RefreshOutlined />} disabled={disabled || refreshing} onClick={onRefresh}>Actualizar</Button></Stack>
  </AdminFilterCard>
}

export function PromotionTable({ list, columns, children }) {
  return <AdminTableCard>
    {list.error && <Alert severity="error" action={<Button onClick={list.reload}>Reintentar</Button>}>{list.error}</Alert>}
    <TableContainer><Table aria-label="Promociones"><TableHead><TableRow>{columns.map((label) => <TableCell key={label} align={label === 'Acciones' ? 'center' : 'left'}>{label}</TableCell>)}</TableRow></TableHead>
      <TableBody>{list.loading ? <TableRow><TableCell colSpan={columns.length} align="center"><CircularProgress size={28} aria-label="Cargando" /></TableCell></TableRow> : list.contenido.length ? children : <TableRow><TableCell colSpan={columns.length} align="center">No se encontraron resultados.</TableCell></TableRow>}</TableBody>
    </Table></TableContainer>
    <TablePagination component="div" count={list.totalElementos} page={list.page} rowsPerPage={list.size} rowsPerPageOptions={[10, 20, 50]} labelRowsPerPage="Filas por página" labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`} onPageChange={(_, page) => list.setPage(page)} onRowsPerPageChange={(event) => { list.setSize(Number(event.target.value)); list.setPage(0) }} disabled={list.loading} />
  </AdminTableCard>
}

export function ConfirmationDialog({ action, busy, error, onClose, onConfirm }) {
  const label = action?.kind === 'eliminar' ? 'Eliminar' : action?.kind === 'activar' ? 'Activar' : action?.kind === 'desactivar' ? 'Desactivar' : 'Finalizar'
  return <ConfirmActionDialog open={Boolean(action)} title={action?.title} busy={busy} error={error} onClose={onClose} onConfirm={onConfirm} confirmLabel={label} color={action?.danger ? 'error' : action?.kind === 'activar' ? 'success' : 'warning'}>{action?.message}</ConfirmActionDialog>
}

export function DetailDialog({ detail, onClose }) {
  const colors = { Activo: 'success', Inactivo: 'default', ACTIVA: 'success', PENDIENTE: 'warning', FINALIZADA: 'default', CANCELADA: 'error' }
  return <AdminDialog open={Boolean(detail)} onClose={onClose} fullWidth maxWidth="sm"><DialogTitle>{detail?.title}</DialogTitle><DialogContent>
    {detail?.loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress aria-label="Cargando detalle" /></Box> : detail?.error ? <Alert severity="error">{detail.error}</Alert> : <>
      {detail?.warning && <Alert severity="warning" sx={{ mb: 2 }}>{detail.warning}</Alert>}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Información general</Typography>
      <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>{detail?.fields?.map(([label, value]) => <Box key={label} sx={{ gridColumn: ['Nombre', 'Descripción'].includes(label) ? '1 / -1' : undefined }}><Typography component="dt" sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 700, mb: 0.6 }}>{label}</Typography><Box component="dd" sx={{ m: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: 'text.primary', fontWeight: label === 'Nombre' ? 800 : 500 }}>{label === 'Estado' ? <Chip size="small" label={value ?? 'No disponible'} color={colors[value] ?? 'default'} /> : value ?? '—'}</Box></Box>)}</Box>
    </>}
  </DialogContent><DialogActions><Button variant="outlined" onClick={onClose}>Cerrar</Button></DialogActions></AdminDialog>
}
