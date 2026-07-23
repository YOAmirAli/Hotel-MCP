import { NextRequest, NextResponse } from 'next/server'
import { callMCPTool } from '@/lib/mcp/server'

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    // Detect if user wants to perform an action
    const actionPatterns: Record<string, { tool: string; extractParams: (text: string) => any }> = {
      'book|reserve': {
        tool: 'create_booking',
        extractParams: (text) => {
          // Simple extraction – would use NLP in production
          const dates = text.match(/\d{4}-\d{2}-\d{2}/g)
          return {
            checkIn: dates?.[0] || new Date().toISOString().split('T')[0],
            checkOut: dates?.[1] || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            roomId: 1,
            guestName: 'Guest',
            guestEmail: 'guest@example.com',
          }
        },
      },
      'cancel|remove booking': {
        tool: 'cancel_booking',
        extractParams: (text) => {
          const id = text.match(/\d+/)
          return { bookingId: id ? parseInt(id[0]) : 1 }
        },
      },
      'available|free room': {
        tool: 'check_availability',
        extractParams: (text) => {
          const dates = text.match(/\d{4}-\d{2}-\d{2}/g)
          return {
            checkIn: dates?.[0] || new Date().toISOString().split('T')[0],
            checkOut: dates?.[1] || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            guests: 2,
          }
        },
      },
    }

    let response = ''
    let toolUsed = false

    // Check if message matches any action pattern
    for (const [pattern, config] of Object.entries(actionPatterns)) {
      if (new RegExp(pattern, 'i').test(message)) {
        try {
          const params = config.extractParams(message)
          const result = await callMCPTool(config.tool, params)
          toolUsed = true
          response = `✅ I've ${config.tool === 'create_booking' ? 'created a booking' : 
            config.tool === 'cancel_booking' ? 'cancelled the booking' : 
            'checked availability'} for you:\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
          break
        } catch (error: any) {
          response = `❌ I couldn't complete that action: ${error.message}`
          break
        }
      }
    }

    // If no action was taken, use Claude for general chat
    if (!toolUsed) {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: `You are a helpful hotel front-desk assistant. 
                   You can help guests with check-in, check-out, amenities, policies, and bookings.
                   Use the MCP tools when users want to book, cancel, or check availability.`,
          messages: [
            ...(history || []).map((h: any) => ({
              role: h.role,
              content: h.content,
            })),
            { role: 'user', content: message },
          ],
        }),
      })

      const data = await claudeResponse.json()
      response = data.content?.[0]?.text || "I'm sorry, I couldn't process that request."
    }

    return NextResponse.json({
      success: true,
      reply: response,
      toolUsed,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 500 }
    )
  }
}