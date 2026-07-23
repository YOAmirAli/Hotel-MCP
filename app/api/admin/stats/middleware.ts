import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth/jwt'

// Routes that don't require authentication
const publicPaths = ['/', '/rooms', '/booking', '/api/auth/login', '/api/auth/register', '/api/auth/register-hotel', '/api/rooms/availability']

// Routes that require admin role
const adminPaths = ['/api/admin', '/admin']

// Routes that require hotel manager role
const managerPaths = ['/api/manager', '/manager']

// Routes that require staff or admin role (existing staff routes)
const staffPaths = ['/api/staff', '/staff']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next()
  }

  // Get token
  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    // Redirect to login for page requests, return 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = verifyToken(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin routes
  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Manager routes
  if (managerPaths.some(path => pathname.startsWith(path))) {
    if (payload.role !== 'hotel_manager' && payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Staff routes (existing)
  if (staffPaths.some(path => pathname.startsWith(path))) {
    if (payload.role !== 'staff' && payload.role !== 'admin' && payload.role !== 'hotel_manager') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Attach user to request
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', String(payload.userId))
  requestHeaders.set('x-user-role', payload.role)
  if (payload.hotelId) {
    requestHeaders.set('x-hotel-id', String(payload.hotelId))
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/staff/:path*',
    '/dashboard/:path*',
    '/reservations/:path*',
    '/check-in/:path*',
    '/login',
  ],
}