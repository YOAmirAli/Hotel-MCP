import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/get-user'
import { reviewRegistrationSchema } from '@/lib/validations/auth.schema'
import { errorResponse, jsonResponse, slugify } from '@/lib/utils/helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status, auth } = requireAuth(request, ['admin'])
  if (error || !auth) return errorResponse(error!, status)

  const { id } = await params
  const requestId = Number(id)
  if (Number.isNaN(requestId)) return errorResponse('Invalid request id', 400)

  const body = await request.json()
  const parsed = reviewRegistrationSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
  }

  const registrationRequest = await prisma.hotelRegistration.findUnique({
    where: { id: requestId },
  })

  if (!registrationRequest) return errorResponse('Registration request not found', 404)
  if (registrationRequest.status !== 'pending') {
    return errorResponse('This request has already been reviewed', 400)
  }

  if (parsed.data.status === 'rejected') {
    const updated = await prisma.hotelRegistration.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        adminNotes: parsed.data.adminNotes,
        processedBy: auth.userId,
        processedAt: new Date(),
      },
    })
    return jsonResponse({ request: updated, message: 'Registration rejected' })
  }

  const hotelSlug = slugify(registrationRequest.hotelName)

  const result = await prisma.$transaction(async (tx) => {
    const hotel = await tx.hotel.create({
      data: {
        name: registrationRequest.hotelName,
        description: registrationRequest.description,
        address: registrationRequest.hotelAddress,
        city: registrationRequest.hotelCity,
        country: registrationRequest.hotelCountry,
        phone: registrationRequest.hotelPhone,
        email: registrationRequest.hotelEmail,
        status: 'pending',
        registrationId: requestId,
      },
    })

    if (registrationRequest.managerId) {
      await tx.user.update({
        where: { id: registrationRequest.managerId },
        data: { hotelId: hotel.id },
      })
    }

    const updatedRequest = await tx.hotelRegistration.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        adminNotes: parsed.data.adminNotes,
        processedBy: auth.userId,
        processedAt: new Date(),
        hotelId: hotel.id,
      },
    })

    return { hotel, request: updatedRequest, slug: hotelSlug }
  })

  return jsonResponse({
    request: result.request,
    hotel: result.hotel,
    message: 'Registration approved. The hotel manager can now complete their hotel profile and add rooms.',
  })
}
