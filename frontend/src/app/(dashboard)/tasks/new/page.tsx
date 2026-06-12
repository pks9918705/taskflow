'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskForm } from '@/components/tasks/TaskForm'

export default function NewTaskPage() {
  const router = useRouter()

  return (
    <div>
      <PageHeader
        title="Create New Task"
        action={
          <Button variant="outline" asChild>
            <Link href="/tasks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <TaskForm onSuccess={() => router.push('/tasks')} />
        </CardContent>
      </Card>
    </div>
  )
}
