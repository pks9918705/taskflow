'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskSearch } from '@/components/tasks/TaskSearch'
import { TaskFiltersBar } from '@/components/tasks/TaskFilters'
import { TaskSort } from '@/components/tasks/TaskSort'
import { DeleteTaskDialog } from '@/components/tasks/DeleteTaskDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useDeleteTask, useUpdateTask } from '@/hooks/useTasks'
import { useToast } from '@/hooks/use-toast'
import { getAdminTasks } from '@/services/admin.service'
import type { Task, TaskFilters, TaskStatus } from '@/types'
import type { ApiError } from '@/types'

function useAdminTasks(filters: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { status, priority, search, sortBy, sortOrder, page, limit } = filters

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getAdminTasks({ status, priority, search, sortBy, sortOrder, page, limit })
      setTasks(res.data)
      setMeta(res.meta)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr.message ?? 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [status, priority, search, sortBy, sortOrder, page, limit])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const optimisticRemove = useCallback(
    (id: string): (() => void) => {
      const snapshot = tasks
      setTasks((prev) => prev.filter((t) => t.id !== id))
      return () => setTasks(snapshot)
    },
    [tasks]
  )

  const optimisticPatch = useCallback(
    (id: string, changes: Partial<Task>): (() => void) => {
      const snapshot = tasks
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)))
      return () => setTasks(snapshot)
    },
    [tasks]
  )

  return { tasks, meta, isLoading, error, refetch: fetchTasks, optimisticRemove, optimisticPatch }
}

export default function AdminTasksPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [filters, setFilters] = useState<TaskFilters>({
    page: Number(searchParams.get('page') ?? 1),
    limit: 9,
    sortBy: (searchParams.get('sortBy') as TaskFilters['sortBy']) ?? 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as TaskFilters['sortOrder']) ?? 'desc',
    status: (searchParams.get('status') as TaskFilters['status']) ?? undefined,
    priority: (searchParams.get('priority') as TaskFilters['priority']) ?? undefined,
    search: searchParams.get('search') ?? undefined,
  })
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(searchInput, 300)

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { tasks, meta, isLoading, error, refetch, optimisticRemove, optimisticPatch } = useAdminTasks(filters)
  const { mutate: deleteTask } = useDeleteTask()
  const { mutate: updateTask } = useUpdateTask()

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch || undefined, page: 1 }))
  }, [debouncedSearch])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.page && filters.page > 1) params.set('page', String(filters.page))
    if (filters.sortBy && filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy)
    if (filters.sortOrder && filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder)
    if (filters.status) params.set('status', filters.status)
    if (filters.priority) params.set('priority', filters.priority)
    if (filters.search) params.set('search', filters.search)
    const qs = params.toString()
    router.replace(`${pathname}${qs ? '?' + qs : ''}`, { scroll: false })
  }, [filters, router, pathname])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteTarget(null)

    const rollback = optimisticRemove(deleteTarget.id)

    try {
      await deleteTask(deleteTarget.id)
      toast({ title: 'Task deleted' })
    } catch (err) {
      rollback()
      const apiErr = err as ApiError
      toast({
        title: 'Could not delete task',
        description: apiErr.message ?? 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, deleteTask, optimisticRemove, toast])

  const handleStatusChange = useCallback(async (task: Task, next: TaskStatus) => {
    const rollback = optimisticPatch(task.id, { status: next })
    try {
      await updateTask(task.id, { status: next })
    } catch (err) {
      rollback()
      const apiErr = err as ApiError
      toast({
        title: 'Could not update status',
        description: apiErr.message ?? 'Please try again',
        variant: 'destructive',
      })
    }
  }, [optimisticPatch, updateTask, toast])

  const totalPages = meta?.totalPages ?? 1
  const currentPage = filters.page ?? 1
  const total = meta?.total ?? 0
  const start = total === 0 ? 0 : (currentPage - 1) * (filters.limit ?? 9) + 1
  const end = Math.min(currentPage * (filters.limit ?? 9), total)

  return (
    <div>
      <PageHeader title="All Tasks (Admin View)" />

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <Button variant="ghost" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <TaskSearch value={searchInput} onChange={setSearchInput} />
        <TaskFiltersBar
          filters={filters}
          onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated, page: 1 }))}
        />
        <TaskSort
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onChange={(sortBy, sortOrder) =>
            setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }))
          }
        />
      </div>

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        showOwner
        onEdit={(task) => router.push(`/tasks/${task.id}/edit`)}
        onDelete={(task) => setDeleteTarget(task)}
        onStatusChange={handleStatusChange}
      />

      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {start}–{end} of {total} tasks
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 3), currentPage + 2)
              .map((p) => (
                <Button
                  key={p}
                  variant={p === currentPage ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                >
                  {p}
                </Button>
              ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <DeleteTaskDialog
        task={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
