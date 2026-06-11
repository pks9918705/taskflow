'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { getAdminUsers } from '@/services/admin.service'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types'
import type { ApiError } from '@/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminUsers()
      setUsers(data)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr.message ?? 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div>
      <PageHeader title="Users" description="Manage all registered users" />

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      )}

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))}

            {!isLoading && users.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No users found
                </td>
              </tr>
            )}

            {!isLoading &&
              users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.role === 'ADMIN' ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
