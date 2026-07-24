import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || !payload.hotelId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const roomTypes = await prisma.roomType.findMany({
      where: { hotelId: payload.hotelId },
      include: { rooms: true },
    })
    return NextResponse.json({ success: true, data: roomTypes })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || !payload.hotelId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { name, basePrice, capacity, imageUrl } = await request.json()
    const roomType = await prisma.roomType.create({
      data: {
        hotelId: payload.hotelId,
        name,
        basePrice,
        capacity,
        imageUrl,
      },
    })
    return NextResponse.json({ success: true, data: roomType })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}