import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authStorage } from '../lib/storage'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  hasPassword: boolean
  setPassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'blog_admin_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPassword, setHasPassword] = useState(false)

  useEffect(() => {
    const sessionValid = sessionStorage.getItem(SESSION_KEY) === 'true'
    setIsAuthenticated(sessionValid)
    setHasPassword(authStorage.hasPassword())
    setIsLoading(false)
  }, [])

  const login = async (password: string): Promise<boolean> => {
    const ok = await authStorage.verifyPassword(password)
    if (ok) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setIsAuthenticated(true)
    }
    return ok
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)
  }

  const setPassword = async (password: string) => {
    await authStorage.setPassword(password)
    setHasPassword(true)
    sessionStorage.setItem(SESSION_KEY, 'true')
    setIsAuthenticated(true)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, hasPassword, setPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
