import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taxmate_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login if token expired
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taxmate_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api