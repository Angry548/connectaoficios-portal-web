import apiJava from './apiJava'

const planes = '/api/planes-promocion'
const promociones = '/api/promociones'
const listar = async (url, filtros = {}) => {
  const params = Object.fromEntries(Object.entries(filtros).filter(([, value]) => value !== '' && value != null))
  const { data } = await apiJava.get(url, { params })
  return {
    contenido: Array.isArray(data?.contenido) ? data.contenido : [],
    totalElementos: Number(data?.totalElementos) || 0,
  }
}

export default {
  obtenerPlanes: (filtros) => listar(`${planes}/paginados`, filtros),
  obtenerPlanPorId: async (id) => (await apiJava.get(`${planes}/${id}`)).data,
  crearPlan: async (body) => (await apiJava.post(planes, body)).data,
  editarPlan: async (id, body) => (await apiJava.put(`${planes}/${id}`, body)).data,
  activarPlan: async (id) => (await apiJava.put(`${planes}/${id}/activar`)).data,
  desactivarPlan: async (id) => (await apiJava.put(`${planes}/${id}/desactivar`)).data,
  eliminarPlan: async (id) => (await apiJava.delete(`${planes}/${id}`)).data,
  obtenerPromociones: (filtros) => listar(`${promociones}/paginadas`, filtros),
  obtenerPromocionPorId: async (id) => (await apiJava.get(`${promociones}/${id}`)).data,
  finalizarPromocion: async (id) => (await apiJava.put(`${promociones}/${id}/finalizar`)).data,
}
