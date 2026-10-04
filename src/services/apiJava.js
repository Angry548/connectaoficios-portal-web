import axios from 'axios'
import { API_CONFIG } from '../config/apiConfig'

const apiJava = axios.create({
  baseURL: API_CONFIG.JAVA_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiJava.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem(
        'adminToken',
      )

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }

    return config
  },
  (error) =>
    Promise.reject(error),
)

apiJava.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401
    ) {
      sessionStorage.removeItem(
        'adminToken',
      )

      sessionStorage.removeItem(
        'adminUser',
      )

      if (
        window.location.pathname !==
        '/login'
      ) {
        window.dispatchEvent(
          new Event(
            'admin-session-expired',
          ),
        )
      }
    }

    return Promise.reject(error)
  },
)

export default apiJava