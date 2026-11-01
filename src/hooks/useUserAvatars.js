import { useCallback, useEffect, useState } from 'react'
import { obtenerFotos, invalidarFotos } from '../services/avatarService'
import { claveAvatar, consultasAvatar, rolDeUsuario } from '../utils/avatars'

export default function useUserAvatars(usuarios) {
  const consulta = JSON.stringify(consultasAvatar(usuarios))
  const [revision, setRevision] = useState(0)
  const [resultado, setResultado] = useState({ consulta: '', revision: -1, fotos: {}, error: false })
  const reintentar = useCallback(() => {
    invalidarFotos(JSON.parse(consulta))
    setRevision((actual) => actual + 1)
  }, [consulta])
  useEffect(() => {
    if (consulta === '[]') return undefined
    const timer = window.setInterval(reintentar, 300000)
    return () => window.clearInterval(timer)
  }, [consulta, reintentar])
  useEffect(() => {
    window.addEventListener('user-avatar-updated', reintentar)
    return () => window.removeEventListener('user-avatar-updated', reintentar)
  }, [reintentar])
  useEffect(() => {
    const controller = new AbortController()
    obtenerFotos(JSON.parse(consulta), controller.signal).then((fotos) => {
      if (!controller.signal.aborted) setResultado({ consulta, revision, fotos, error: false })
    }).catch(() => {
      if (!controller.signal.aborted) setResultado({ consulta, revision, fotos: {}, error: true })
    })
    return () => controller.abort()
  }, [consulta, revision])
  const vigente = resultado.consulta === consulta && resultado.revision === revision
  return {
    fotoDe: (usuario) => vigente ? resultado.fotos[claveAvatar(
      usuario?.usuarioId ?? usuario?.id ?? usuario?.Id, rolDeUsuario(usuario))] ?? null : null,
    error: vigente && resultado.error,
    reintentar,
  }
}
