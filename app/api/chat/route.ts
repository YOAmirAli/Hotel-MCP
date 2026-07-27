import { NextRequest, NextResponse } from 'next/server'
import { mcpTools } from '@/lib/mcp/server'

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    // Detect which tool to use
    let toolResult = null
    let toolUsed = false

    // Check for availability request
    if (/available|free room|show rooms|find room/i.test(message)) {
      const dates = message.match(/\d{4}-\d{2}-\d{2}/g)
      toolResult = await mcpTools.checkAvailability(
        dates?.[0] || new Date().toISOString().split('T')[0],
        dates?.[1] || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        2
      )
      toolUsed = true
    }

    // Check for booking request
    if (/book|reserve|i want to book|make a booking/i.test(message)) {
      const dates = message.match(/\d{4}-\d{2}-\d{2}/g)
      const name = message.match(/for\s+([a-zA-Z]+\s+[a-zA-Z]+)/i)
      toolResult = await mcpTools.createBooking({
        roomId: 1, // Would need to extract from context
        checkIn: dates?.[0] || new Date().toISOString().split('T')[0],
        checkOut: dates?.[1] || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        guestName: name?.[1] || 'Guest',
        guestEmail: 'guest@example.com',
      })
      toolUsed = true
    }

    // Check for cancellation
    if (/cancel|remove booking/i.test(message)) {
      const id = message.match(/\d+/)
      toolResult = await mcpTools.cancelBooking(id ? parseInt(id[0]) : 1)
      toolUsed = true
    }

    // If tool was used, return result directly
    if (toolUsed) {
      return NextResponse.json({
        success: true,
        reply: `✅ I've completed that action:\n\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\``,
        toolUsed: true,
      })
    }

    // Otherwise, call Claude API if configured
    if (process.env.CLAUDE_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: `You are a helpful hotel front-desk assistant for LuxeStay.
                   You can help guests with check-in, check-out, amenities, policies, and bookings.
                   If a user wants to book, cancel, or check availability, let them know you can help with that.
                   Keep responses warm, professional, and concise.`,
          messages: [
            ...(history || []).map((h: any) => ({
              role: h.role,
              content: h.content,
            })),
            { role: 'user', content: message },
          ],
        }),
      })

      const data = await response.json()
      const reply = data.content?.[0]?.text || "I'm sorry, I couldn't process that request."

      return NextResponse.json({
        success: true,
        reply,
        toolUsed: false,
      })
    }

    return NextResponse.json({
      success: true,
      reply: "Welcome to LuxeStay! I can help you check room availability, create bookings, or manage reservations. How may I assist you today?",
      toolUsed: false,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 500 }
    )
  }
}