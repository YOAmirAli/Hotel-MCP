import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'N8N webhook endpoint is ready.',
  })
}
