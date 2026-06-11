'use client'

import { useRouter } from 'next/navigation'
import { Pencil, Trash2, CalendarDays, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { formatDate, isOverdue, cn } from '@/lib/utils'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  showOwner?: boolean
}

export function TaskCard({ task, onEdit, onDelete, showOwner }: TaskCardProps) {
  const router = useRouter()
  const overdue = task.dueDate && task.status !== 'DONE' && isOverdue(task.dueDate)

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:border-primary/30',
        overdue && 'border-red-200 dark:border-red-800'
      )}
      onClick={() => router.push(`/tasks/${task.id}`)}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">
            {task.title}
          </h3>
          <TaskPriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {showOwner && (
          <p className="text-xs text-muted-foreground">
            Owner: {task.userId}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <TaskStatusBadge status={task.status} />
            {task.dueDate && (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs',
                  overdue ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                {overdue ? (
                  <AlertCircle className="h-3 w-3" />
                ) : (
                  <CalendarDays className="h-3 w-3" />
                )}
                {overdue ? 'Overdue · ' : ''}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
