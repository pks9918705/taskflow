'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Task,
  ActivityLog,
  TaskFilters,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/types'
import type { PaginatedResponse } from '@/types'
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskActivity,
} from '@/services/tasks.service'
import type { ApiError } from '@/types'

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useTasksQuery(filters: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response: PaginatedResponse<Task> = await getTasks(filters)
      setTasks(response.data)
      setMeta(response.meta)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr.message ?? 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [
    filters.status,
    filters.priority,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.limit,
  ])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, meta, isLoading, error, refetch: fetchTasks }
}

export function useTaskQuery(id: string) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTask = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTaskById(id)
      setTask(data)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr.message ?? 'Failed to load task')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  return { task, isLoading, error, refetch: fetchTask }
}

export function useCreateTask() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    setIsLoading(true)
    setError(null)
    try {
      const task = await createTask(input)
      return task
    } catch (err) {
      const apiErr = err as ApiError
      const message = apiErr.message ?? 'Failed to create task'
      setError(message)
      throw apiErr
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useUpdateTask() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<Task> => {
      setIsLoading(true)
      setError(null)
      try {
        const task = await updateTask(id, input)
        return task
      } catch (err) {
        const apiErr = err as ApiError
        const message = apiErr.message ?? 'Failed to update task'
        setError(message)
        throw apiErr
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { mutate, isLoading, error }
}

export function useDeleteTask() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteTask(id)
    } catch (err) {
      const apiErr = err as ApiError
      const message = apiErr.message ?? 'Failed to delete task'
      setError(message)
      throw apiErr
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useTaskActivity(id: string) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTaskActivity(id)
      setLogs(data)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr.message ?? 'Failed to load activity')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { logs, isLoading, error }
}
