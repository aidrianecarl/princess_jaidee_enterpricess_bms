import { useState, useCallback } from 'react'
import { authApi } from '@/lib/api'
import { apiClient } from '@/lib/api-client'

interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: any) => Promise<void>
  adminLogin: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export function useAuth(isAdmin = false): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.clientLogin(email, password)
      const { token, user } = response.data

      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
    } catch (err) {
      const errorMessage = apiClient.getErrorMessage(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.clientSignup(data)
      const { token, user } = response.data

      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
    } catch (err) {
      const errorMessage = apiClient.getErrorMessage(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const adminLogin = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.adminLogin(email, password)
      const { token, user } = response.data

      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      setUser(user)
    } catch (err) {
      const errorMessage = apiClient.getErrorMessage(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    if (isAdmin) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    } else {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
    setUser(null)
  }, [isAdmin])

  const isAuthenticated = !!user || !!localStorage.getItem(isAdmin ? 'admin_token' : 'auth_token')

  return { user, loading, error, login, signup, adminLogin, logout, isAuthenticated }
}
