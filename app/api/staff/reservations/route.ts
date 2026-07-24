import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    reservations: [],
    message: 'Staff reservations endpoint is ready.',
  })
}
