import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/get-user'
import { roomSchema } from '@/lib/validations/auth.schema'
import { errorResponse, jsonResponse } from '@/lib/utils/helpers'

export async function POST(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['admin'])
  if (error || !auth) return errorResponse(error!, status)

  const body = await request.json()
  const parsed = roomSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
  }

  const roomType = await prisma.roomType.findUnique({ where: { id: parsed.data.roomTypeId } })
  if (!roomType) return errorResponse('Room type not found', 404)

  const existing = await prisma.room.findUnique({ where: { roomNumber: parsed.data.roomNumber } })
  if (existing) return errorResponse('Room number already exists', 409)

  const room = await prisma.room.create({
    data: parsed.data,
    include: { roomType: { include: { hotel: { select: { id: true, name: true } } } } },
  })

  return jsonResponse({ room }, 201)
}

export async function PATCH(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['admin'])
  if (error || !auth) return errorResponse(error!, status)

  const body = await request.json()
  const { id, ...updates } = body as { id?: number; roomNumber?: string; floor?: number; status?: string; roomTypeId?: number }

  if (!id) return errorResponse('Room id is required', 400)

  const existing = await prisma.room.findUnique({ where: { id } })
  if (!existing) return errorResponse('Room not found', 404)

  const parsed = roomSchema.partial().safeParse(updates)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
  }

  if (parsed.data.roomNumber && parsed.data.roomNumber !== existing.roomNumber) {
    const duplicate = await prisma.room.findUnique({ where: { roomNumber: parsed.data.roomNumber } })
    if (duplicate) return errorResponse('Room number already exists', 409)
  }

  const room = await prisma.room.update({
    where: { id },
    data: parsed.data,
    include: { roomType: { include: { hotel: { select: { id: true, name: true } } } } },
  })

  return jsonResponse({ room })
}

export async function DELETE(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['admin'])
  if (error || !auth) return errorResponse(error!, status)

  const id = Number(request.nextUrl.searchParams.get('id'))
  if (Number.isNaN(id)) return errorResponse('Room id is required', 400)

  const bookingCount = await prisma.booking.count({ where: { roomId: id } })
  if (bookingCount > 0) {
    return errorResponse('Cannot delete room with existing bookings', 400)
  }

  await prisma.room.delete({ where: { id } })
  return jsonResponse({ message: 'Room deleted' })
}
