import apiClient from '@/lib/api/client'
import type { Task, User, TaskFilters, PaginatedResponse } from '@/types'

export async function getAdminTasks(
  filters: TaskFilters
): Promise<PaginatedResponse<Task>> {
  const params: Record<string, string | number> = {}
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.search) params.search = filters.search
  if (filters.sortBy) params.sortBy = filters.sortBy
  if (filters.sortOrder) params.sortOrder = filters.sortOrder
  if (filters.page !== undefined) params.page = filters.page
  if (filters.limit !== undefined) params.limit = filters.limit

  const { data } = await apiClient.get('/admin/tasks', { params })
  return data
}

export async function getAdminUsers(): Promise<User[]> {
  const { data } = await apiClient.get('/admin/users')
  return data.data
}
