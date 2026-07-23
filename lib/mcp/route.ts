import { NextRequest, NextResponse } from 'next/server'
import { callMCPTool } from '@/lib/mcp/server'

export async function POST(request: NextRequest) {
  try {
    const { tool, args } = await request.json()

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      )
    }

    const result = await callMCPTool(tool, args || {})
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'MCP tool execution failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // List available tools
  return NextResponse.json({
    tools: [
      { name: 'check_availability', description: 'Check room availability' },
      { name: 'create_booking', description: 'Create a new booking' },
      { name: 'get_booking', description: 'Get booking details' },
      { name: 'cancel_booking', description: 'Cancel a booking' },
    ],
  })
}