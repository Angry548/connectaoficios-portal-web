import AdminDialog from '../../components/AdminDialog'
import { useState } from 'react'
import { Alert, Button, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"
import { obtenerMensajeError, validarPlan } from './promotionUtils'

export default function PromotionPlanForm({ plan, onClose, onSave }) {
  const [values, setValues] = useState({ nombre: plan?.nombre ?? '', descripcion: plan?.descripcion ?? '', duracionDias: plan?.duracionDias ?? '', precio: plan?.precio ?? '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const validation = validarPlan(values)
    setErrors(validation)
    if (Object.keys(validation).length) return
    setBusy(true); setError('')
    try { await onSave({ nombre: values.nombre.trim(), descripcion: values.descripcion.trim(), duracionDias: Number(values.duracionDias), precio: Number(values.precio) }) }
    catch (err) { setError(obtenerMensajeError(err)); setBusy(false) }
  }
  return <AdminDialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm"><DialogTitle>{plan ? 'Editar plan de promoción' : 'Nueva promoción'}</DialogTitle>
    <form onSubmit={submit} noValidate><DialogContent><Stack useFlexGap spacing={2} sx={{ pt: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, '& > .MuiAlert-root': { gridColumn: '1 / -1' } }}>
      {error && <Alert severity="error">{error}</Alert>}
      {[['nombre', 'Nombre', 'text'], ['descripcion', 'Descripción', 'text'], ['duracionDias', 'Duración en días', 'number'], ['precio', 'Precio (USD)', 'number']].map(([name, label, type]) => <TextField key={name} sx={{ gridColumn: ['nombre', 'descripcion'].includes(name) ? '1 / -1' : undefined }} label={label} type={type} value={values[name]} disabled={busy} required={name !== 'descripcion'} multiline={name === 'descripcion'} minRows={name === 'descripcion' ? 3 : undefined} error={Boolean(errors[name])} helperText={errors[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} slotProps={{ htmlInput: name === 'nombre' ? { maxLength: 100 } : name === 'descripcion' ? { maxLength: 500 } : { min: name === 'precio' ? 0 : 1, step: name === 'precio' ? 'any' : 1 } }} />)}
    </Stack></DialogContent><DialogActions><Button variant="outlined" disabled={busy} onClick={onClose}>Cancelar</Button><Button type="submit" variant="contained" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button></DialogActions></form>
  </AdminDialog>
}
