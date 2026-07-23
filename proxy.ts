import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth/jwt'

const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/mcp',
  '/',
  '/rooms',
  '/booking',
  '/register/hotel',
  '/login',
]

const staffPaths = ['/api/staff', '/staff', '/dashboard', '/reservations', '/check-in', '/manage-rooms']
const adminPaths = ['/api/admin', '/admin']
const managerPaths = ['/api/manager', '/manager']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // MCP endpoint is public but can be secured via API key in production
  if (pathname.startsWith('/api/mcp')) {
    return NextResponse.next()
  }

  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/api/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  if (staffPaths.some((path) => pathname.startsWith(path))) {
    if (payload.role !== 'staff' && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  if (adminPaths.some((path) => pathname.startsWith(path))) {
    if (payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (managerPaths.some((path) => pathname.startsWith(path))) {
    if (payload.role !== 'hotel_manager' && payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', String(payload.userId))
  requestHeaders.set('x-user-role', payload.role)
  requestHeaders.set('x-user-email', payload.email)
  if (payload.hotelId) {
    requestHeaders.set('x-hotel-id', String(payload.hotelId))
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/api/:path*',
    '/staff/:path*',
    '/dashboard/:path*',
    '/reservations/:path*',
    '/check-in/:path*',
    '/manage-rooms/:path*',
    '/admin/:path*',
    '/manager/:path*',
  ],
}
