import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return NextResponse.json({
    success: true,
    bookingId: id,
    message: 'Booking detail endpoint is ready.',
  })
}

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return NextResponse.json({
    success: true,
    bookingId: id,
    message: 'Booking update endpoint is ready.',
  })
}
