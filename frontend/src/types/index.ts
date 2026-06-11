export type Role = 'USER' | 'ADMIN'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface User {
  id: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  taskId: string
  userId: string
  action: string
  changes?: Record<string, unknown>
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string>
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
  sortBy?: 'dueDate' | 'priority' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
}

export type UpdateTaskInput = Partial<CreateTaskInput>
