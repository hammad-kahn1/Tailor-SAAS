import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('tailorsaas_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('tailorsaas_token')
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.data)
        localStorage.setItem('tailorsaas_user', JSON.stringify(data.data))
      })
      .catch(() => {
        localStorage.removeItem('tailorsaas_token')
        localStorage.removeItem('tailorsaas_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('tailorsaas_token', data.data.token)
    localStorage.setItem('tailorsaas_user', JSON.stringify(data.data.user))
    setUser(data.data.user)
    return data.data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('tailorsaas_token')
      localStorage.removeItem('tailorsaas_user')
      setUser(null)
    }
  }, [])

  const hasRole = useCallback((roles) => {
    if (!user) return false
    const list = Array.isArray(roles) ? roles : [roles]
    return list.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
