import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = parseInt(params.id)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: {
          include: {
            roomType: {
              include: {
                hotel: true,
              },
            },
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}