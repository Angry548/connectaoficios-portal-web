import RowActionsMenu from '../../components/RowActionsMenu'
import { useRef, useState } from 'react'
import { Alert, Box, Button, Chip, Snackbar, Stack, TableCell, TableRow, Typography } from '@mui/material'
import service from '../../services/adminPromotionsService'
import { useAuth } from '../../context/AuthContext'
import usePromotionList from './usePromotionList'
import { ConfirmationDialog, DetailDialog, PromotionFilters, PromotionTable } from './PromotionComponents'
import PromotionPlanForm from './PromotionPlanForm'
import { obtenerMensajeError, precio } from './promotionUtils'

const fields = [
  { name: 'texto', label: 'Nombre o descripción' },
  { name: 'activo', label: 'Estado', options: [['', 'Todos'], ['true', 'Activo'], ['false', 'Inactivo']] },
  ...[['duracionMinima', 'Duración mínima'], ['duracionMaxima', 'Duración máxima'], ['precioMinimo', 'Precio mínimo'], ['precioMaximo', 'Precio máximo']].map(([name, label]) => ({ name, label, type: 'number' })),
]

export default function PromotionPlansPage() {
  const { usuario } = useAuth()
  const principal = usuario?.rol === 'AdministradorPrincipal'
  const list = usePromotionList(service.obtenerPlanes)
  const [form, setForm] = useState(null)
  const [action, setAction] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [detail, setDetail] = useState(null)
  const request = useRef(0)
  async function loadPlan(id, edit = false) {
    const current = ++request.current
    setDetail({ title: 'Detalle del plan', loading: true })
    try {
      const plan = await service.obtenerPlanPorId(id)
      if (current !== request.current) return
      if (edit) { setDetail(null); setForm({ plan }) }
      else setDetail({ title: 'Detalle del plan', fields: [['ID', plan.id], ['Nombre', plan.nombre], ['Descripción', plan.descripcion], ['Duración', `${plan.duracionDias} días`], ['Precio', precio(plan.precio)], ['Estado', plan.activo ? 'Activo' : 'Inactivo']] })
    } catch (err) { if (current === request.current) setDetail({ title: 'Detalle del plan', error: obtenerMensajeError(err) }) }
  }
  async function confirm() {
    if (!action || busy || (action.kind === 'eliminar' && !principal)) return
    setBusy(true); setError('')
    try {
      await service[action.kind === 'eliminar' ? 'eliminarPlan' : action.kind === 'activar' ? 'activarPlan' : 'desactivarPlan'](action.id)
      setAction(null); setNotice('Operación realizada correctamente.'); await list.reload()
    } catch (err) { setError(obtenerMensajeError(err)) }
    finally { setBusy(false) }
  }
  return <Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}><Typography variant="h6" fontWeight={700}>Planes de Promoción</Typography><Button variant="contained" onClick={() => setForm({ plan: null })}>Nueva promoción</Button></Stack>
    <PromotionFilters fields={fields} onApply={list.apply} disabled={busy || list.loading} onRefresh={list.reload} refreshing={list.loading} />
    <PromotionTable list={list} columns={['Nombre', 'Descripción', 'Duración', 'Precio', 'Estado', 'Acciones']}>
      {list.contenido.map((plan) => <TableRow key={plan.id} hover>
        <TableCell>{plan.nombre}</TableCell><TableCell sx={{ maxWidth: 300, overflowWrap: 'anywhere' }}>{plan.descripcion || '—'}</TableCell><TableCell>{plan.duracionDias} días</TableCell><TableCell>{precio(plan.precio)}</TableCell><TableCell><Chip size="small" color={plan.activo ? 'success' : 'default'} label={plan.activo ? 'Activo' : 'Inactivo'} /></TableCell>
        <TableCell align="center"><RowActionsMenu disabled={busy} label={`Acciones del plan #${plan.id}`} actions={[
 { label: 'Ver detalle', onClick: () => loadPlan(plan.id) },
 { label: 'Editar', onClick: () => loadPlan(plan.id, true) },
 { label: plan.activo ? 'Desactivar' : 'Activar', onClick: () => { setError(''); setAction({ id: plan.id, kind: plan.activo ? 'desactivar' : 'activar', title: plan.activo ? 'Desactivar plan' : 'Activar plan', message: `\u00bfDesea ${plan.activo ? 'desactivar' : 'activar'} el plan "${plan.nombre}"?` }) } },
 principal && { label: 'Eliminar', destructive: true, onClick: () => { setError(''); setAction({ id: plan.id, kind: 'eliminar', title: 'Eliminar plan', message: `\u00bfDesea eliminar el plan "${plan.nombre}"? Esta acci\u00f3n no se puede deshacer.`, danger: true }) } },
 ]} /></TableCell>
      </TableRow>)}
    </PromotionTable>
    {form && <PromotionPlanForm plan={form.plan} onClose={() => setForm(null)} onSave={async (body) => { if (form.plan) await service.editarPlan(form.plan.id, body); else await service.crearPlan(body); setForm(null); setNotice('Plan guardado correctamente.'); await list.reload() }} />}
    <ConfirmationDialog action={action} busy={busy} error={error} onClose={() => setAction(null)} onConfirm={confirm} />
    <DetailDialog detail={detail} onClose={() => { request.current++; setDetail(null) }} />
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert></Snackbar>
  </Box>
}
