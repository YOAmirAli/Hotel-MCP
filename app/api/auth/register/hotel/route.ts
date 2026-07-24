import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { signToken } from '@/lib/auth/jwt'
import { hotelRegistrationSchema } from '@/lib/validations/auth.schema'
import { errorResponse, jsonResponse } from '@/lib/utils/helpers'

/**
 * Hotel manager initial registration.
 * Creates a manager account + pending registration request for admin approval.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = hotelRegistrationSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
    }

    const {
      email,
      password,
      firstName,
      lastName,
      hotelName,
      address,
      city,
      country,
      phone,
      description,
    } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return errorResponse('Email already registered', 409)
    }

    const hashed = await bcrypt.hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashed,
          firstName,
          lastName,
          role: 'hotel_manager',
        },
      })

      const registrationRequest = await tx.hotelRegistrationRequest.create({
        data: {
          applicantId: user.id,
          hotelName,
          address,
          city,
          country,
          phone,
          description,
          status: 'pending',
        },
      })

      return { user, registrationRequest }
    })

    const role = result.user.role as 'guest' | 'hotel_manager' | 'staff' | 'admin'

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
      role,
      hotelId: null,
    })

    const response = jsonResponse(
      {
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role,
          hotelId: null,
        },
        registrationRequest: {
          id: result.registrationRequest.id,
          hotelName: result.registrationRequest.hotelName,
          status: result.registrationRequest.status,
        },
        message:
          'Registration submitted. An admin will review your hotel request before you can complete your listing.',
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
    return errorResponse('Hotel registration failed', 500)
  }
}
