import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { Accept: 'application/json' },
})

// Attach the Sanctum bearer token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tailorsaas_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralized error handling: auto-logout on 401, surface validation errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tailorsaas_token')
      localStorage.removeItem('tailorsaas_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
