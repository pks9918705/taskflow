import { Badge } from '@/components/ui/badge'
import type { TaskPriority } from '@/types'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  if (priority === 'HIGH') {
    return (
      <Badge variant="destructive">{PRIORITY_LABELS[priority]}</Badge>
    )
  }
  if (priority === 'MEDIUM') {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800">
        {PRIORITY_LABELS[priority]}
      </Badge>
    )
  }
  return (
    <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}
