import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { signToken } from '@/lib/auth/jwt'
import { loginSchema } from '@/lib/validations/auth.schema'
import { errorResponse, jsonResponse } from '@/lib/utils/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    const valid = await bcrypt.compare(parsed.data.password, user.password)
    if (!valid) {
      return errorResponse('Invalid email or password', 401)
    }

    const role = user.role as 'guest' | 'hotel_manager' | 'staff' | 'admin'

    const token = signToken({
      userId: user.id,
      email: user.email,
      role,
      hotelId: user.hotelId ?? undefined,
    })

    const response = jsonResponse({
      success: true, // <-- ADDED THIS
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role,
        hotelId: user.hotelId,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return errorResponse('Login failed', 500)
  }
}