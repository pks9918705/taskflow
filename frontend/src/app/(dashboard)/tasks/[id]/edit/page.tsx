'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskForm } from '@/components/tasks/TaskForm'
import { useTaskQuery } from '@/hooks/useTasks'

interface EditTaskPageProps {
  params: { id: string }
}

export default function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = params
  const router = useRouter()
  const { task, isLoading, error } = useTaskQuery(id)

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Task not found</h2>
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
        title="Edit Task"
        action={
          <Button variant="outline" asChild>
            <Link href={`/tasks/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <TaskForm task={task} onSuccess={() => router.push(`/tasks/${id}`)} />
        </CardContent>
      </Card>
    </div>
  )
}
