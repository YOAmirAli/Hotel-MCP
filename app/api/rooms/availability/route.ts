import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    availability: [],
    message: 'Availability endpoint is ready.',
  })
}
