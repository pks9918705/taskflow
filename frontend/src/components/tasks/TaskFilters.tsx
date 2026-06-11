'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TaskFilters } from '@/types'

interface TaskFiltersProps {
  filters: TaskFilters
  onChange: (updated: Partial<TaskFilters>) => void
}

export function TaskFiltersBar({ filters, onChange }: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={filters.status ?? 'ALL'}
        onValueChange={(val) =>
          onChange({ status: val === 'ALL' ? undefined : (val as TaskFilters['status']) })
        }
      >
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? 'ALL'}
        onValueChange={(val) =>
          onChange({ priority: val === 'ALL' ? undefined : (val as TaskFilters['priority']) })
        }
      >
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Priorities</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
