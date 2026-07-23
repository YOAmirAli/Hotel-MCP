import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/get-user'
import { roomTypeSchema, roomSchema } from '@/lib/validations/auth.schema'
import { errorResponse, jsonResponse } from '@/lib/utils/helpers'

async function requireApprovedManager(auth: { userId: number; hotelId?: number | null }) {
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      registrationRequests: { where: { status: 'approved' }, take: 1 },
    },
  })

  if (!user || user.role !== 'hotel_manager') {
    return { error: 'Forbidden', status: 403 as const, hotelId: null }
  }

  if (!user.hotelId || user.registrationRequests.length === 0) {
    return {
      error: 'Hotel registration must be approved before managing rooms',
      status: 403 as const,
      hotelId: null,
    }
  }

  return { error: null, status: 200 as const, hotelId: user.hotelId }
}

export async function GET(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['hotel_manager'])
  if (error || !auth) return errorResponse(error!, status)

  const ctx = await requireApprovedManager(auth)
  if (ctx.error || !ctx.hotelId) return errorResponse(ctx.error!, ctx.status)

  const roomTypes = await prisma.roomType.findMany({
    where: { hotelId: ctx.hotelId },
    include: { rooms: true },
    orderBy: { name: 'asc' },
  })

  return jsonResponse({ roomTypes })
}

export async function POST(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['hotel_manager'])
  if (error || !auth) return errorResponse(error!, status)

  const ctx = await requireApprovedManager(auth)
  if (ctx.error || !ctx.hotelId) return errorResponse(ctx.error!, ctx.status)

  const body = await request.json()
  const parsed = roomTypeSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
  }

  const roomType = await prisma.roomType.create({
    data: {
      hotelId: ctx.hotelId,
      name: parsed.data.name,
      description: parsed.data.description,
      basePrice: parsed.data.basePrice,
      capacity: parsed.data.capacity,
      amenities: parsed.data.amenities ?? [],
      imageUrl: parsed.data.imageUrl || null,
    },
    include: { rooms: true },
  })

  return jsonResponse({ roomType }, 201)
}

export async function PATCH(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['hotel_manager'])
  if (error || !auth) return errorResponse(error!, status)

  const ctx = await requireApprovedManager(auth)
  if (ctx.error || !ctx.hotelId) return errorResponse(ctx.error!, ctx.status)

  const body = await request.json()
  const { id, ...updates } = body as { id?: number }
  if (!id) return errorResponse('Room type id is required', 400)

  const existing = await prisma.roomType.findFirst({
    where: { id, hotelId: ctx.hotelId },
  })
  if (!existing) return errorResponse('Room type not found', 404)

  const parsed = roomTypeSchema.partial().safeParse(updates)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
  }

  const roomType = await prisma.roomType.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.basePrice !== undefined && { basePrice: parsed.data.basePrice }),
      ...(parsed.data.capacity !== undefined && { capacity: parsed.data.capacity }),
      ...(parsed.data.amenities !== undefined && { amenities: parsed.data.amenities }),
      ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl || null }),
    },
    include: { rooms: true },
  })

  return jsonResponse({ roomType })
}

export async function PUT(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['hotel_manager'])
  if (error || !auth) return errorResponse(error!, status)

  const ctx = await requireApprovedManager(auth)
  if (ctx.error || !ctx.hotelId) return errorResponse(ctx.error!, ctx.status)

  const body = await request.json()
  const parsed = roomSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
  }

  const roomType = await prisma.roomType.findFirst({
    where: { id: parsed.data.roomTypeId, hotelId: ctx.hotelId },
  })
  if (!roomType) return errorResponse('Room type not found for your hotel', 404)

  const existing = await prisma.room.findUnique({ where: { roomNumber: parsed.data.roomNumber } })
  if (existing) return errorResponse('Room number already exists', 409)

  const room = await prisma.room.create({ data: parsed.data, include: { roomType: true } })
  return jsonResponse({ room }, 201)
}
