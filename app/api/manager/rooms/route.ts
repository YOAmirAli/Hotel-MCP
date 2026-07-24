import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyToken } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || !payload.hotelId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { roomTypeId, roomNumber, floor, status } = await request.json()

    // Verify roomType belongs to this hotel
    const roomType = await prisma.roomType.findFirst({
      where: { id: roomTypeId, hotelId: payload.hotelId },
    })
    if (!roomType) return NextResponse.json({ error: 'Room type not found for this hotel' }, { status: 404 })

    const room = await prisma.room.create({
      data: {
        roomTypeId,
        roomNumber,
        floor,
        status: status || 'available',
      },
    })
    return NextResponse.json({ success: true, data: room })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}