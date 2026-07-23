import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/jwt'
import { z } from 'zod'

const registerHotelSchema = z.object({
  hotelName: z.string().min(2),
  managerEmail: z.string().email(),
  managerFirstName: z.string().min(1),
  managerLastName: z.string().min(1),
  managerPhone: z.string().optional(),
  hotelAddress: z.string().optional(),
  hotelCity: z.string().optional(),
  hotelCountry: z.string().optional(),
  hotelPhone: z.string().optional(),
  hotelEmail: z.string().email().optional(),
  description: z.string().optional(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registerHotelSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validated.error.format() },
        { status: 400 }
      )
    }

    const data = validated.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.managerEmail },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Create registration request with manager user
    const registration = await prisma.hotelRegistration.create({
      data: {
        hotelName: data.hotelName,
        managerEmail: data.managerEmail,
        managerFirstName: data.managerFirstName,
        managerLastName: data.managerLastName,
        managerPhone: data.managerPhone,
        hotelAddress: data.hotelAddress,
        hotelCity: data.hotelCity,
        hotelCountry: data.hotelCountry,
        hotelPhone: data.hotelPhone,
        hotelEmail: data.hotelEmail,
        description: data.description,
        status: 'pending',
        manager: {
          create: {
            email: data.managerEmail,
            password: hashPassword(data.password),
            firstName: data.managerFirstName,
            lastName: data.managerLastName,
            phone: data.managerPhone,
            role: 'hotel_manager',
          },
        },
      },
      include: { manager: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Registration submitted for approval',
      data: { registrationId: registration.id },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}