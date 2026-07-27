import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const featuredRooms = await prisma.room.findMany({
      where: {
        roomType: {
          hotel: {
            status: 'approved',
          },
        },
        status: 'available',
      },
      take: 6,
      include: {
        roomType: {
          include: {
            hotel: true,
          },
        },
      },
      orderBy: {
        roomType: {
          basePrice: 'desc',
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: featuredRooms,
    })
  } catch (error) {
    console.error('Featured rooms error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured rooms' },
      { status: 500 }
    )
  }
}
