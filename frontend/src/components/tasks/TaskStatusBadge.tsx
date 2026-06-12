import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '@/types'

interface TaskStatusBadgeProps {
  status: TaskStatus
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  if (status === 'DONE') {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
        {STATUS_LABELS[status]}
      </Badge>
    )
  }
  if (status === 'IN_PROGRESS') {
    return <Badge variant="default">{STATUS_LABELS[status]}</Badge>
  }
  return <Badge variant="secondary">{STATUS_LABELS[status]}</Badge>
}
