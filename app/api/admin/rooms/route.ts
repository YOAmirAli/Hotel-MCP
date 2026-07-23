import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/get-user'
import { roomTypeSchema, roomSchema } from '@/lib/validations/auth.schema'
import { errorResponse, jsonResponse } from '@/lib/utils/helpers'

export async function GET(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['admin'])
  if (error || !auth) return errorResponse(error!, status)

  const hotelId = request.nextUrl.searchParams.get('hotelId')

  const roomTypes = await prisma.roomType.findMany({
    where: hotelId ? { hotelId: Number(hotelId) } : undefined,
    include: {
      hotel: { select: { id: true, name: true, slug: true } },
      rooms: true,
    },
    orderBy: { name: 'asc' },
  })

  return jsonResponse({ roomTypes })
}

export async function POST(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['admin'])
  if (error || !auth) return errorResponse(error!, status)

  const body = await request.json()
  const parsed = roomTypeSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
  }

  if (!parsed.data.hotelId) {
    return errorResponse('hotelId is required for admin room type creation', 400)
  }

  const hotel = await prisma.hotel.findUnique({ where: { id: parsed.data.hotelId } })
  if (!hotel) return errorResponse('Hotel not found', 404)

  const roomType = await prisma.roomType.create({
    data: {
      hotelId: parsed.data.hotelId,
      name: parsed.data.name,
      description: parsed.data.description,
      basePrice: parsed.data.basePrice,
      capacity: parsed.data.capacity,
      amenities: parsed.data.amenities ?? [],
      imageUrl: parsed.data.imageUrl || null,
    },
    include: { hotel: { select: { id: true, name: true } }, rooms: true },
  })

  return jsonResponse({ roomType }, 201)
}
