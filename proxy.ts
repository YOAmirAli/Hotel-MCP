import { authMiddleware } from './lib/auth/middleware'

export function proxy(request: any) {
  return authMiddleware(request)
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
    '/booking/:path*',
    '/my-bookings/:path*',
    '/login',
  ],
}
