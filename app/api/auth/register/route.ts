import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { signToken } from '@/lib/auth/jwt'
import { registerSchema } from '@/lib/validations/auth.schema'
import { errorResponse, jsonResponse } from '@/lib/utils/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
    }

    const { email, password, firstName, lastName, role = 'guest' } = parsed.data

    // Only allow guest/staff self-registration; admin is seeded separately
    if (role === 'admin' || role === 'hotel_manager') {
      return errorResponse('Use the hotel registration endpoint for manager accounts', 400)
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return errorResponse('Email already registered', 409)
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName, lastName, role },
    })

    const userRole = user.role as 'guest' | 'hotel_manager' | 'staff' | 'admin'

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: userRole,
      hotelId: user.hotelId ?? undefined,
    })

    const response = jsonResponse(
      {
        success: true, // <-- ADDED THIS
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: userRole,
          hotelId: user.hotelId,
        },
      },
      201
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return errorResponse('Registration failed', 500)
  }
}