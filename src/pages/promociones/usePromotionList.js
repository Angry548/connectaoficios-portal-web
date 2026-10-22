import { useCallback, useEffect, useRef, useState } from 'react'
import { obtenerMensajeError } from './promotionUtils'

export default function usePromotionList(listar) {
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState({ contenido: [], totalElementos: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const sequence = useRef(0)
  const reload = useCallback(async () => {
    const current = ++sequence.current
    setLoading(true)
    setError('')
    try {
      const result = await listar({ ...filters, page, size })
      if (sequence.current !== current) return
      if (page > 0 && page * size >= result.totalElementos) setPage(Math.max(0, Math.ceil(result.totalElementos / size) - 1))
      else setData(result)
    } catch (err) {
      if (sequence.current === current) { setError(obtenerMensajeError(err)); setData({ contenido: [], totalElementos: 0 }) }
    } finally {
      if (sequence.current === current) setLoading(false)
    }
  }, [listar, filters, page, size])
  useEffect(() => {
    const tracker = sequence
    // Synchronize the remote page when its filters or pagination change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload()
    return () => { tracker.current++ }
  }, [reload])
  return { ...data, page, size, loading, error, reload, setPage, setSize, apply: (values) => { setPage(0); setFilters(values) } }
}
