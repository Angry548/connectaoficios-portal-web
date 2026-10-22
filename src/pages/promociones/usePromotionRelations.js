import { useCallback, useEffect, useState } from 'react'
import adminServicesService from '../../services/adminServicesService'
import adminUsersService from '../../services/adminUsersService'
import service from '../../services/adminPromotionsService'
import createEntityCache, { resolveEntityNames } from '../../utils/entityCache'

const userName = (user) => user.nombre ?? user.Nombre ?? ''
const serviceName = (entity) => entity.titulo ?? ''

export default function usePromotionRelations(rows) {
  const [services] = useState(() => createEntityCache(adminServicesService.obtenerServicioPorId))
  const [workers] = useState(() => createEntityCache(adminUsersService.obtenerUsuarioPorId))
  const [revision, setRevision] = useState(0)
  const [names, setNames] = useState({ services: {}, workers: {}, loading: false, failed: false })

  const lookup = useCallback(async (promotions) => {
    const [serviceNames, workerNames] = await Promise.all([
      resolveEntityNames(promotions, services, 'servicioId', serviceName),
      resolveEntityNames(promotions, workers, 'trabajadorId', userName),
    ])
    return { services: serviceNames.names, workers: workerNames.names, failed: serviceNames.failed || workerNames.failed }
  }, [services, workers])

  useEffect(() => {
    let active = true
    // Fetch auxiliary labels without blocking the promotion list or its actions.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNames((current) => ({ ...current, loading: true, failed: false }))
    lookup(rows).then((result) => { if (active) setNames({ ...result, loading: false }) })
    return () => { active = false }
  }, [rows, lookup, revision])

  const searchServices = useCallback(async (texto) => {
    const result = await adminServicesService.obtenerServicios({ texto, page: 0, size: 10 })
    result.contenido.forEach((entity) => services.seed(entity))
    return result.contenido
  }, [services])
  const searchWorkers = useCallback(async (texto) => {
    const result = await adminUsersService.buscarUsuarios(texto, 2, 10)
    const options = (Array.isArray(result) ? result : []).filter((user) => {
      const role = user.rol ?? user.Rol
      const roleId = user.rolId ?? user.RolId
      return role ? role === 'Trabajador' : roleId != null ? Number(roleId) === 2 : true
    })
    options.forEach((entity) => workers.seed(entity))
    return options
  }, [workers])
  const searchPlans = useCallback(async (texto) => {
    const result = await service.obtenerPlanes({ texto, page: 0, size: 20 })
    return result.contenido
  }, [])
  return { ...names, lookup, searchServices, searchWorkers, searchPlans, retry: () => setRevision((value) => value + 1) }
}
