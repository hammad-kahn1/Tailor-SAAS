import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { user: u, token } = data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      const u = data.data
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
    } catch {}
  }, [])

  // Role helpers
  const isSuperAdmin  = user?.role === 'super_admin'
  const isShopOwner   = user?.role === 'shop_owner'
  const isManager     = user?.role === 'manager'
  const isTailor      = user?.role === 'tailor'
  const isReceptionist= user?.role === 'receptionist'
  const canManage     = ['super_admin','shop_owner','manager'].includes(user?.role)
  const canViewReports= ['super_admin','shop_owner','manager'].includes(user?.role)

  const hasRole = (...roles) => roles.includes(user?.role)

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout, refreshUser,
      isSuperAdmin, isShopOwner, isManager, isTailor, isReceptionist,
      canManage, canViewReports, hasRole,
      isAuthenticated: !!user,
      tenantName: user?.tenant?.name,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
