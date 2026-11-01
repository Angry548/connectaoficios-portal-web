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

// Java owns secondary domain features, not the .NET session.
// Let callers handle authorization errors without discarding identity credentials.
export default apiJava
