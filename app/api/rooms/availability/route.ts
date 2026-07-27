import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

function parseDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const checkIn = parseDate(searchParams.get('checkIn'))
  const checkOut = parseDate(searchParams.get('checkOut'))
  const guests = parseInt(searchParams.get('guests') || '1', 10)

  if (!checkIn || !checkOut || checkOut <= checkIn || guests < 1) {
    return NextResponse.json(
      { success: false, error: 'Invalid query parameters' },
      { status: 400 }
    )
  }

  try {
    const rooms = await prisma.room.findMany({
      where: {
        status: 'available',
        roomType: {
          hotel: {
            status: 'approved',
          },
          capacity: {
            gte: guests,
          },
        },
        bookings: {
          none: {
            AND: [
              { checkIn: { lt: checkOut } },
              { checkOut: { gt: checkIn } },
            ],
          },
        },
      },
      include: {
        roomType: {
          include: {
            hotel: true,
          },
        },
      },
    })

    const data = rooms.map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      roomType: {
        id: room.roomType.id,
        name: room.roomType.name,
        description: room.roomType.description,
        basePrice: room.roomType.basePrice,
        capacity: room.roomType.capacity,
        amenities: room.roomType.amenities ?? [],
        imageUrl: room.roomType.imageUrl,
        hotel: {
          id: room.roomType.hotel.id,
          name: room.roomType.hotel.name,
        },
      },
      pricePerNight: room.roomType.basePrice,
      totalPrice: room.roomType.basePrice * Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
      nights: Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Availability endpoint error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch available rooms' },
      { status: 500 }
    )
  }
}
