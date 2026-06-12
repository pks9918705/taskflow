import { CheckSquare } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TaskFlow',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="mb-8 flex items-center gap-2">
        <CheckSquare className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">TaskFlow</span>
      </div>
      <div className="w-full max-w-sm bg-background rounded-xl border shadow-sm p-6">
        {children}
      </div>
    </div>
  )
}
