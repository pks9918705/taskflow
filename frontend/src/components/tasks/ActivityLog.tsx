'use client'

import {
  CheckCircle2,
  PencilLine,
  Trash2,
  Plus,
  Activity,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTaskActivity } from '@/hooks/useTasks'
import { formatRelative } from '@/lib/utils'

interface ActivityLogProps {
  taskId: string
}

function getActionIcon(action: string) {
  if (action.toLowerCase().includes('create')) return <Plus className="h-4 w-4 text-green-500" />
  if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit'))
    return <PencilLine className="h-4 w-4 text-blue-500" />
  if (action.toLowerCase().includes('delete')) return <Trash2 className="h-4 w-4 text-red-500" />
  if (action.toLowerCase().includes('complete') || action.toLowerCase().includes('done'))
    return <CheckCircle2 className="h-4 w-4 text-green-500" />
  return <Activity className="h-4 w-4 text-muted-foreground" />
}

export function ActivityLog({ taskId }: ActivityLogProps) {
  const { logs, isLoading } = useTaskActivity(taskId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No activity yet
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
            {getActionIcon(log.action)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              Task <span className="font-medium">{log.action}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelative(log.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
