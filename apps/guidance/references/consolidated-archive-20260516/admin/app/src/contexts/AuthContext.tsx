'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, User, AuthTokens } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const authService = AuthService.getInstance()

  useEffect(() => {
    initializeAuth()
  }, [])

  async function initializeAuth() {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    setLoading(true)
    try {
      const { user: loggedInUser } = await authService.login(email, password)
      setUser(loggedInUser)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    hasPermission: (permission: string) => authService.hasPermission(permission),
    hasRole: (role: string) => authService.hasRole(role),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}