
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const approveSchema = z.object({
  registrationId: z.number().int().positive(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = approveSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validated.error.format() },
        { status: 400 }
      )
    }

    // Verify admin
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { registrationId, action, notes } = validated.data

    const registration = await prisma.hotelRegistration.findUnique({
      where: { id: registrationId },
      include: { manager: true },
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (registration.status !== 'pending') {
      return NextResponse.json(
        { error: 'Registration already processed' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Create hotel
      const hotel = await prisma.hotel.create({
        data: {
          name: registration.hotelName,
          description: registration.description,
          address: registration.hotelAddress,
          city: registration.hotelCity,
          country: registration.hotelCountry,
          phone: registration.hotelPhone,
          email: registration.hotelEmail,
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: payload.userId,
          registrationId: registration.id,
        },
      })

      // Update registration
      const updatedRegistration = await prisma.hotelRegistration.update({
        where: { id: registrationId },
        data: {
          status: 'approved',
          processedAt: new Date(),
          processedBy: payload.userId,
          hotelId: hotel.id,
        },
      })

      // Update manager user with hotelId
      if (registration.manager) {
        await prisma.user.update({
          where: { id: registration.manager.id },
          data: {
            hotelId: hotel.id,
            role: 'hotel_manager',
          },
        })
      }

      // Create default room types for the hotel
      await prisma.roomType.createMany({
        data: [
          { hotelId: hotel.id, name: 'Standard Room', basePrice: 150, capacity: 2 },
          { hotelId: hotel.id, name: 'Deluxe Suite', basePrice: 300, capacity: 2 },
          { hotelId: hotel.id, name: 'Executive Suite', basePrice: 500, capacity: 4 },
        ],
      })

      return NextResponse.json({
        success: true,
        message: 'Hotel approved successfully',
        data: { hotelId: hotel.id },
      })
    } else {
      // Reject
      await prisma.hotelRegistration.update({
        where: { id: registrationId },
        data: {
          status: 'rejected',
          processedAt: new Date(),
          processedBy: payload.userId,
          adminNotes: notes,
        },
      })

      // Delete the manager user (or keep as guest)
      // For now, we'll keep them but change role to guest
      if (registration.manager) {
        await prisma.user.update({
          where: { id: registration.manager.id },
          data: { role: 'guest' },
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Registration rejected',
      })
    }
  } catch (error) {
    console.error('Approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}