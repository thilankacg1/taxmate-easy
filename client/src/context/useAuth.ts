import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export interface AuthContextType {
  user: {
    id: number
    email: string
    full_name: string
    abn: string | null
    gst_registered: boolean
  } | null
  loading: boolean
  login: (token: string, userData: AuthContextType['user'] & object) => void
  logout: () => void
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}