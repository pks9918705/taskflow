import apiClient from '@/lib/api/client'
import type {
  Task,
  ActivityLog,
  TaskFilters,
  CreateTaskInput,
  UpdateTaskInput,
  PaginatedResponse,
} from '@/types'

export async function getTasks(
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

  const { data } = await apiClient.get('/tasks', { params })
  return data
}

export async function getTaskById(id: string): Promise<Task> {
  const { data } = await apiClient.get(`/tasks/${id}`)
  return data.data
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data } = await apiClient.post('/tasks', input)
  return data.data
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const { data } = await apiClient.patch(`/tasks/${id}`, input)
  return data.data
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}

export async function getTaskActivity(id: string): Promise<ActivityLog[]> {
  const { data } = await apiClient.get(`/tasks/${id}/activity`)
  return data.data
}
