import axios from 'axios'
import { API_CONFIG } from '../config/apiConfig'

const apiDotNet = axios.create({
  baseURL: API_CONFIG.DOTNET_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiDotNet.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('adminToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

apiDotNet.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('adminToken')
      sessionStorage.removeItem('adminUser')

      if (window.location.pathname !== '/login') {
        window.dispatchEvent(new Event('admin-session-expired'))
      }
    }

    return Promise.reject(error)
  },
)

export default apiDotNet