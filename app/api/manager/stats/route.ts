import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = verifyToken(token)
    if (!payload || !payload.hotelId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get hotel with roomTypes and rooms
    const hotel = await prisma.hotel.findUnique({
      where: { id: payload.hotelId },
      include: {
        roomTypes: {
          include: { rooms: true },
        },
      },
    })

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }

    // Get bookings through rooms
    const allRooms = hotel.roomTypes.flatMap(rt => rt.rooms)
    const roomIds = allRooms.map(r => r.id)

    const bookings = await prisma.booking.findMany({
      where: {
        roomId: { in: roomIds },
      },
    })

    const totalRooms = allRooms.length
    const availableRooms = allRooms.filter(r => r.status === 'available').length
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length

    return NextResponse.json({
      success: true,
      data: {
        hotelName: hotel.name,
        status: hotel.status,
        totalRooms,
        availableRooms,
        totalBookings,
        pendingBookings,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}