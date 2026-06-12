import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/tasks', '/admin']
const AUTH_ROUTES = ['/login', '/signup']

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route))
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  if (isProtected(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (pathname.startsWith('/admin')) {
      const payload = decodeJwtPayload(token)
      if (!payload || payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/tasks', request.url))
      }
    }

    return NextResponse.next()
  }

  if (isAuthRoute(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/tasks', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/tasks/:path*', '/admin/:path*', '/login', '/signup'],
}
