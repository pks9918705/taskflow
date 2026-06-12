import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional(),
})

export const updateTaskSchema = createTaskSchema.partial()

export type CreateTaskFormInput = z.infer<typeof createTaskSchema>
export type UpdateTaskFormInput = z.infer<typeof updateTaskSchema>
