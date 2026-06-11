import apiClient from '@/lib/api/client'
import type { User } from '@/types'

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get('/auth/me')
  return data.data
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post('/auth/login', { email, password })
  return data.data
}

export async function signup(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post('/auth/signup', { email, password })
  return data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
