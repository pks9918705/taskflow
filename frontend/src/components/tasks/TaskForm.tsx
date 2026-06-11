'use client'

import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks'
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskFormInput,
} from '@/lib/validators/task.schema'
import type { Task } from '@/types'
import type { ApiError } from '@/types'

interface TaskFormProps {
  task?: Task
  onSuccess: () => void
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const isEditMode = !!task
  const { toast } = useToast()
  const { mutate: createTask, isLoading: isCreating } = useCreateTask()
  const { mutate: updateTask, isLoading: isUpdating } = useUpdateTask()
  const isLoading = isCreating || isUpdating

  const form = useForm<CreateTaskFormInput>({
    resolver: zodResolver(isEditMode ? updateTaskSchema : createTaskSchema),
    defaultValues: isEditMode
      ? {
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split('T')[0]
            : '',
        }
      : {
          title: '',
          description: '',
          status: 'PENDING',
          priority: 'MEDIUM',
          dueDate: '',
        },
  })

  async function onSubmit(values: CreateTaskFormInput) {
    const payload = {
      ...values,
      description: values.description || undefined,
      dueDate: values.dueDate || undefined,
    }

    try {
      if (isEditMode) {
        await updateTask(task.id, payload)
        toast({ title: 'Task updated', description: 'Your task has been updated.' })
      } else {
        await createTask(payload)
        toast({ title: 'Task created', description: 'Your new task has been created.' })
      }
      onSuccess()
    } catch (err) {
      const apiErr = err as ApiError
      toast({
        title: 'Error',
        description: apiErr.message ?? 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional description"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
        </Button>
      </form>
    </Form>
  )
}
