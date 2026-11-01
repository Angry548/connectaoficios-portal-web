import UserIdentity from '../../components/UserIdentity'
import AvatarNotice from '../../components/AvatarNotice'
import useUserAvatars from '../../hooks/useUserAvatars'
import RowActionsMenu from '../../components/RowActionsMenu'
import { useRef, useState } from 'react'
import { Alert, Box, Button, Chip, Snackbar, TableCell, TableRow, Typography } from "@mui/material"
import service from '../../services/adminPromotionsService'
import usePromotionList from './usePromotionList'
import { ConfirmationDialog, DetailDialog, PromotionFilters, PromotionTable } from './PromotionComponents'
import { fecha, obtenerMensajeError } from './promotionUtils'
import EntityAutocomplete from '../../components/EntityAutocomplete'
import usePromotionRelations from './usePromotionRelations'

const states = ['PENDIENTE', 'ACTIVA', 'FINALIZADA', 'CANCELADA']
const fields = [
  { name: 'estado', label: 'Estado', options: [['', 'Todos'], ...states.map((state) => [state, state])] },
  ...[['Creacion', 'creación'], ['Inicio', 'inicio'], ['Fin', 'fin']].flatMap(([key, label]) => ['Desde', 'Hasta'].map((suffix) => ({ name: `fecha${key}${suffix}`, label: `Fecha de ${label} ${suffix.toLowerCase()}`, type: 'datetime-local' }))),
]
const colors = { ACTIVA: 'success', PENDIENTE: 'warning', FINALIZADA: 'default', CANCELADA: 'error' }
const vigente = (promotion) => typeof promotion.vigente === 'boolean' ? (promotion.vigente ? 'Sí' : 'No') : 'No disponible'
const plan = (p) => p.planNombre || (p.planId != null ? `Plan #${p.planId}` : 'No disponible')
const serviceName = (entity) => entity.titulo ?? ''
const workerName = (entity) => entity.nombre ?? entity.Nombre ?? ''
const workerEmail = (entity) => entity.correo ?? entity.Correo ?? ''
const planName = (entity) => entity.nombre ?? ''
const relationName = (id, names, label) => names[id] || (id != null ? `${label} #${id}` : 'No disponible')

export default function ContractedPromotionsPage() {
  const list = usePromotionList(service.obtenerPromociones)
  const relations = usePromotionRelations(list.contenido)
  const filterFields = [
    { name: 'servicioId', render: (props) => <EntityAutocomplete {...props} label="Servicio" loadOptions={relations.searchServices} getName={serviceName} /> },
    { name: 'planId', render: (props) => <EntityAutocomplete {...props} label="Plan de promoción" loadOptions={relations.searchPlans} getName={planName} minLength={0} /> },
    { name: 'trabajadorId', render: (props) => <EntityAutocomplete {...props} label="Trabajador" personRole="Trabajador" loadOptions={relations.searchWorkers} getName={workerName} getSecondary={workerEmail} /> },
    ...fields,
  ]
  const [action, setAction] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [detail, setDetail] = useState(null)
  const request = useRef(0)
  const avatars = useUserAvatars([
    ...list.contenido.map((p) => ({ id: p.trabajadorId, rol: 'Trabajador' })),
    ...(detail?.trabajadorId ? [{ id: detail.trabajadorId, rol: 'Trabajador' }] : []),
  ])
  async function showDetail(id) {
    const current = ++request.current
    setDetail({ title: 'Detalle de promoción contratada', loading: true })
    try {
      const p = await service.obtenerPromocionPorId(id)
      const names = await relations.lookup([p])
      if (current === request.current) setDetail({ trabajadorId: p.trabajadorId, trabajadorNombre: relationName(p.trabajadorId, names.workers, 'Trabajador'), title: 'Detalle de promoción contratada', warning: names.failed ? 'Algunos nombres no están disponibles. Se muestran sus identificadores.' : '', fields: [['ID', p.id], ['Servicio', relationName(p.servicioId, names.services, 'Servicio')], ['Plan', plan(p)], ['Trabajador', relationName(p.trabajadorId, names.workers, 'Trabajador')], ['Estado', p.estado], ['Fecha creación', fecha(p.fechaCreacion)], ['Fecha inicio', fecha(p.fechaInicio)], ['Fecha fin', fecha(p.fechaFin)], ['Vigente', vigente(p)]] })
    } catch (err) { if (current === request.current) setDetail({ title: 'Detalle de promoción contratada', error: obtenerMensajeError(err) }) }
  }
  async function confirm() {
    if (!action || busy) return
    setBusy(true); setError('')
    try {
      const current = await service.obtenerPromocionPorId(action.id)
      if (current.estado !== 'ACTIVA') { setAction(null); setNotice('La promoción ya no está activa. Se actualizó la lista.'); await list.reload(); return }
      await service.finalizarPromocion(action.id)
      setAction(null); setNotice('Promoción finalizada correctamente.'); await list.reload()
    } catch (err) { setError(obtenerMensajeError(err)) }
    finally { setBusy(false) }
  }
  return <Box>
    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Promociones Contratadas</Typography>
    <AvatarNotice avatars={avatars} />
    <PromotionFilters fields={filterFields} onApply={list.apply} disabled={busy || list.loading} onRefresh={list.reload} refreshing={list.loading} />
    {relations.failed && <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={relations.retry} disabled={relations.loading}>Reintentar nombres</Button>}>No fue posible obtener algunos nombres de servicios o trabajadores. Puede continuar usando la tabla.</Alert>}
    <PromotionTable list={list} columns={['ID', 'Servicio', 'Plan', 'Trabajador', 'Estado', 'Fecha creación', 'Fecha inicio', 'Fecha fin', 'Vigente', 'Acciones']}>
      {list.contenido.map((p) => <TableRow key={p.id} hover><TableCell>{p.id}</TableCell><TableCell><Typography fontWeight={600}>{relations.loading && !relations.services[p.servicioId] ? 'Cargando servicio…' : relationName(p.servicioId, relations.services, 'Servicio')}</Typography><Typography variant="caption" color="text.secondary">ID: {p.servicioId ?? '—'}</Typography></TableCell><TableCell>{plan(p)}</TableCell><TableCell><Typography fontWeight={600}><UserIdentity nombre={relationName(p.trabajadorId, relations.workers, 'Trabajador')} fotoUrl={avatars.fotoDe({ id: p.trabajadorId, rol: 'Trabajador' })} /></Typography><Typography variant="caption" color="text.secondary">ID: {p.trabajadorId ?? '—'}</Typography></TableCell><TableCell><Chip size="small" label={p.estado ?? 'No disponible'} color={colors[p.estado] ?? 'default'} /></TableCell><TableCell>{fecha(p.fechaCreacion)}</TableCell><TableCell>{fecha(p.fechaInicio)}</TableCell><TableCell>{fecha(p.fechaFin)}</TableCell><TableCell>{vigente(p)}</TableCell><TableCell align="center"><RowActionsMenu disabled={busy} label={`Acciones de la promoci\u00f3n #${p.id}`} actions={[
 { label: 'Ver detalle', onClick: () => showDetail(p.id) },
 p.estado === 'ACTIVA' && { label: 'Finalizar', onClick: () => { setError(''); setAction({ id: p.id, title: 'Finalizar promoci\u00f3n', message: `\u00bfDesea finalizar la promoci\u00f3n #${p.id}?` }) } },
 ]} /></TableCell></TableRow>)}
    </PromotionTable>
    <ConfirmationDialog action={action} busy={busy} error={error} onClose={() => setAction(null)} onConfirm={confirm} />
    <DetailDialog detail={detail} avatar={detail?.trabajadorId ? <UserIdentity nombre={detail.trabajadorNombre} fotoUrl={avatars.fotoDe({ id: detail.trabajadorId, rol: 'Trabajador' })} /> : null} onClose={() => { request.current++; setDetail(null) }} />
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert></Snackbar>
  </Box>
}
