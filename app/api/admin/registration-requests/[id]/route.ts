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

  const registrationRequest = await prisma.hotelRegistrationRequest.findUnique({
    where: { id: requestId },
    include: { applicant: true },
  })

  if (!registrationRequest) return errorResponse('Registration request not found', 404)
  if (registrationRequest.status !== 'pending') {
    return errorResponse('This request has already been reviewed', 400)
  }

  if (parsed.data.status === 'rejected') {
    const updated = await prisma.hotelRegistrationRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        adminNotes: parsed.data.adminNotes,
        reviewedById: auth.userId,
        reviewedAt: new Date(),
      },
    })
    return jsonResponse({ request: updated, message: 'Registration rejected' })
  }

  // Approve: create hotel shell and link manager
  let slug = slugify(registrationRequest.hotelName)
  const slugExists = await prisma.hotel.findUnique({ where: { slug } })
  if (slugExists) slug = `${slug}-${Date.now()}`

  const result = await prisma.$transaction(async (tx) => {
    const hotel = await tx.hotel.create({
      data: {
        name: registrationRequest.hotelName,
        slug,
        address: registrationRequest.address,
        city: registrationRequest.city,
        country: registrationRequest.country,
        phone: registrationRequest.phone,
        description: registrationRequest.description,
        status: 'pending_profile',
      },
    })

    await tx.user.update({
      where: { id: registrationRequest.applicantId },
      data: { hotelId: hotel.id },
    })

    const updatedRequest = await tx.hotelRegistrationRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        adminNotes: parsed.data.adminNotes,
        reviewedById: auth.userId,
        reviewedAt: new Date(),
        hotelId: hotel.id,
      },
      include: {
        applicant: { select: { id: true, email: true, firstName: true, lastName: true } },
        hotel: true,
      },
    })

    return updatedRequest
  })

  return jsonResponse({
    request: result,
    message: 'Registration approved. The hotel manager can now complete their hotel profile and add rooms.',
  })
}
