export { default as obtenerMensajeError } from '../../utils/getApiErrorMessage'

export const precio = (value) => value == null ? '—' : new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value)
export const fecha = (value) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('es-SV') : '—'
}
export function referencia(value, fallback) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return value?.nombre ?? value?.titulo ?? value?.nombreCompleto ?? (value?.id != null ? `#${value.id}` : fallback != null ? `#${fallback}` : '—')
}

export function validarPlan(values) {
  const errors = {}
  if (!values.nombre.trim()) errors.nombre = 'El nombre es obligatorio.'
  else if (values.nombre.length > 100) errors.nombre = 'Máximo 100 caracteres.'
  if (values.descripcion.length > 500) errors.descripcion = 'Máximo 500 caracteres.'
  if (!Number.isSafeInteger(Number(values.duracionDias)) || Number(values.duracionDias) < 1) errors.duracionDias = 'Ingrese un número entero de días, mínimo 1.'
  if (!Number.isFinite(Number(values.precio)) || Number(values.precio) <= 0) errors.precio = 'El precio debe ser mayor que cero.'
  return errors
}

export function validarFiltros(filters) {
  for (const [key, value] of Object.entries(filters)) {
    if (value === '' || key === 'texto' || key === 'estado' || key === 'activo' || key.startsWith('fecha')) continue
    const number = Number(value)
    if (!Number.isFinite(number) || number < (key.startsWith('precio') ? 0 : 1) || (!key.startsWith('precio') && !Number.isSafeInteger(number))) return 'Ingrese valores numéricos válidos en los filtros.'
  }
  for (const [min, max] of [['duracionMinima', 'duracionMaxima'], ['precioMinimo', 'precioMaximo'], ['fechaCreacionDesde', 'fechaCreacionHasta'], ['fechaInicioDesde', 'fechaInicioHasta'], ['fechaFinDesde', 'fechaFinHasta']]) {
    if (filters[min] && filters[max] && (min.startsWith('fecha') ? filters[min] > filters[max] : Number(filters[min]) > Number(filters[max]))) return 'El límite inicial no puede superar el límite final.'
  }
  return ''
}
