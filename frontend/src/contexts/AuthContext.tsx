'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@/types'
import {
  getMe,
  login as loginService,
  signup as signupService,
  logout as logoutService,
} from '@/services/auth.service'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  signup: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string): Promise<User> {
    const data = await loginService(email, password)
    setUser(data)
    return data
  }

  async function signup(email: string, password: string): Promise<User> {
    const data = await signupService(email, password)
    setUser(data)
    return data
  }

  async function logout(): Promise<void> {
    await logoutService()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
