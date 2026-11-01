const networkMessage = 'No fue posible conectar con el servidor. Intente nuevamente.'
const technicalMessage = /cloudinary|timeout|network error|err_network|econn\w*|request failed|axios|stack\s*trace|\bat\s+\S+\s*\(|\b(?:java|javax|org\.springframework|system)\.|exception|traceback|(?:type|reference|syntax|range)error|cannot read propert|sqlstate|jdbc|undefined|null reference|\[object object\]|[{}<>]/i

function readable(value) {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  return text && text.length <= 600 && !technicalMessage.test(text) ? text : ''
}

function backendMessage(data) {
  if (typeof data === 'string') return readable(data)
  if (!data || typeof data !== 'object') return ''
  // Java messages and .NET ProblemDetails / validation responses.
  for (const key of ['mensaje', 'message', 'Mensaje', 'Message', 'detail']) {
    const text = readable(data[key])
    if (text) return text
  }
  if (data.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat().map(readable).filter(Boolean)
    if (messages.length) return messages.slice(0, 3).join(' ')
  }
  return readable(data.title)
}

export default function getApiErrorMessage(error, options = {}) {
  if (['ECONNABORTED', 'ETIMEDOUT'].includes(error?.code) || /timeout/i.test(error?.message ?? '')) {
    return 'El servidor tardó demasiado en responder. Intente nuevamente.'
  }
  const status = error?.response?.status
  if (!status) {
    // Preserve only known, intentional frontend validation messages.
    const localMessages = [
      'La respuesta del servidor no contiene una sesión válida.',
      'Esta cuenta no tiene acceso al portal administrativo.',
      'El identificador del reporte no es válido.',
      'La acción seleccionada no es válida.',
      'No fue posible identificar el usuario que debe suspenderse.',
      'Este reporte no tiene un servicio relacionado.',
    ]
    return localMessages.includes(error?.message) ? error.message : networkMessage
  }
  if (status === 401) return options.unauthorized ?? 'La sesión ha expirado. Inicie sesión nuevamente.'
  if (status === 403) return 'No tiene permisos para realizar esta acción.'
  const message = backendMessage(error.response.data)
  if (message) return message
  if (status >= 500) return 'Ocurrió un error en el servidor. Intente nuevamente.'
  if (status === 400 || status === 422) return 'Existen campos inválidos. Verifique los datos ingresados.'
  if (status === 404) return options.notFound ?? 'El recurso solicitado no existe.'
  if (status === 409) return 'La operación no puede realizarse en el estado actual.'
  return 'No fue posible completar la solicitud. Intente nuevamente.'
}
