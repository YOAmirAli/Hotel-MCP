import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/get-user'
import { hotelProfileSchema } from '@/lib/validations/auth.schema'
import { errorResponse, jsonResponse } from '@/lib/utils/helpers'

async function getManagerContext(auth: { userId: number; hotelId?: number | null }) {
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      hotel: true,
      registrationRequests: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  if (!user || user.role !== 'hotel_manager') {
    return { error: 'Forbidden', status: 403 as const, user: null }
  }

  const latestRequest = user.registrationRequests[0]
  const isApproved = latestRequest?.status === 'approved' && user.hotelId

  return { error: null, status: 200 as const, user, isApproved: Boolean(isApproved) }
}

export async function GET(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['hotel_manager'])
  if (error || !auth) return errorResponse(error!, status)

  const ctx = await getManagerContext(auth)
  if (ctx.error || !ctx.user) return errorResponse(ctx.error!, ctx.status)

  return jsonResponse({
    user: {
      id: ctx.user.id,
      email: ctx.user.email,
      firstName: ctx.user.firstName,
      lastName: ctx.user.lastName,
      hotelId: ctx.user.hotelId,
    },
    registrationRequest: ctx.user.registrationRequests[0] ?? null,
    hotel: ctx.user.hotel,
    canManageListing: ctx.isApproved,
  })
}

export async function PATCH(request: NextRequest) {
  const { error, status, auth } = requireAuth(request, ['hotel_manager'])
  if (error || !auth) return errorResponse(error!, status)

  const ctx = await getManagerContext(auth)
  if (ctx.error || !ctx.user) return errorResponse(ctx.error!, ctx.status)

  if (!ctx.isApproved || !ctx.user.hotelId) {
    return errorResponse(
      'Your hotel registration must be approved by an admin before you can update your listing.',
      403
    )
  }

  const body = await request.json()
  const parsed = hotelProfileSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
  }

  const hotel = await prisma.hotel.update({
    where: { id: ctx.user.hotelId },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.address !== undefined && { address: parsed.data.address }),
      ...(parsed.data.city !== undefined && { city: parsed.data.city }),
      ...(parsed.data.country !== undefined && { country: parsed.data.country }),
      ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
      ...(parsed.data.email !== undefined && { email: parsed.data.email }),
      ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl || null }),
      // Managers can set their hotel to active once profile is complete
      ...(parsed.data.status === 'active' && { status: 'active' }),
    },
  })

  return jsonResponse({ hotel })
}
