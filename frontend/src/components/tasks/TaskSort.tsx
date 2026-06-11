'use client'

import { ArrowUp, ArrowDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { TaskFilters } from '@/types'

interface TaskSortProps {
  sortBy: TaskFilters['sortBy']
  sortOrder: TaskFilters['sortOrder']
  onChange: (sortBy: TaskFilters['sortBy'], sortOrder: TaskFilters['sortOrder']) => void
}

export function TaskSort({ sortBy, sortOrder, onChange }: TaskSortProps) {
  return (
    <div className="flex items-center gap-1">
      <Select
        value={sortBy ?? 'createdAt'}
        onValueChange={(val) =>
          onChange(val as TaskFilters['sortBy'], sortOrder)
        }
      >
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created Date</SelectItem>
          <SelectItem value="dueDate">Due Date</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() =>
          onChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
        }
        aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
      >
        {sortOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
