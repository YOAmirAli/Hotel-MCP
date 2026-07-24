import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    bookings: [],
    message: 'Bookings listing endpoint is ready.',
  })
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Bookings creation endpoint is ready.',
  })
}
