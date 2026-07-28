/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'
import api from '../services/api'

export interface User {
  id: number
  email: string
  full_name: string
  abn: string | null
  gst_registered: boolean
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('taxmate_token')
      if (token) {
        try {
          const res = await api.get('/auth/me')
          setUser(res.data.user)
        } catch {
          localStorage.removeItem('taxmate_token')
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem('taxmate_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('taxmate_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}