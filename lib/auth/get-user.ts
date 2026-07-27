import { NextRequest } from 'next/server'
import { verifyToken, type JwtPayload } from './jwt'

export function getTokenFromRequest(request: NextRequest): string | null {
  return (
    request.cookies.get('token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '') ||
    null
  )
}

export function getAuthFromRequest(request: NextRequest): JwtPayload | null {
  const headerUserId = request.headers.get('x-user-id')
  const headerRole = request.headers.get('x-user-role')
  const headerHotelId = request.headers.get('x-hotel-id')

  if (headerUserId && headerRole) {
    return {
      userId: Number(headerUserId),
      email: request.headers.get('x-user-email') || '',
      role: headerRole as JwtPayload['role'],
      hotelId: headerHotelId ? Number(headerHotelId) : undefined,
    }
  }

  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export function requireAuth(request: NextRequest, allowedRoles?: JwtPayload['role'][]) {
  const auth = getAuthFromRequest(request)
  if (!auth) {
    return { error: 'Unauthorized', status: 401 as const, auth: null }
  }
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return { error: 'Forbidden', status: 403 as const, auth: null }
  }
  return { error: null, status: 200 as const, auth }
}
