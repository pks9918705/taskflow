'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge'
import { DeleteTaskDialog } from '@/components/tasks/DeleteTaskDialog'
import { ActivityLog } from '@/components/tasks/ActivityLog'
import { useTaskQuery, useDeleteTask } from '@/hooks/useTasks'
import { useToast } from '@/hooks/use-toast'
import { formatDate, formatRelative } from '@/lib/utils'
import type { ApiError } from '@/types'

interface TaskDetailPageProps {
  params: { id: string }
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const { task, isLoading, error } = useTaskQuery(id)
  const { mutate: deleteTask } = useDeleteTask()
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteTask(id)
      toast({ title: 'Task deleted' })
      router.push('/tasks')
    } catch (err) {
      const apiErr = err as ApiError
      toast({
        title: 'Error',
        description: apiErr.message ?? 'Failed to delete task',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDelete(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Task not found</h2>
        <p className="text-muted-foreground text-sm mb-4">
          {error ?? 'This task does not exist or has been deleted.'}
        </p>
        <Button asChild>
          <Link href="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={task.title}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/tasks">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/tasks/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setShowDelete(true)}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {task.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{task.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <TaskStatusBadge status={task.status} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
                  <TaskPriorityBadge priority={task.priority} />
                </div>
                {task.dueDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Due Date</p>
                    <p className="text-sm">{formatDate(task.dueDate)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                  <p className="text-sm">{formatRelative(task.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <ActivityLog taskId={id} />
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteTaskDialog
        task={showDelete ? task : null}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        isLoading={isDeleting}
      />
    </div>
  )
}
