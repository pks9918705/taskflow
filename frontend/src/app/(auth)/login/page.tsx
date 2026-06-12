import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login — TaskFlow',
}

export default function LoginPage() {
  return <LoginForm />
}
