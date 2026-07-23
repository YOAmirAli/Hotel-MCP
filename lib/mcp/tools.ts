import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { prisma } from '@/lib/db/prisma'

// Tool definitions
const tools = [
  {
    name: 'check_availability',
    description: 'Check room availability for given dates',
    inputSchema: {
      type: 'object',
      properties: {
        checkIn: { type: 'string', description: 'Check-in date (YYYY-MM-DD)' },
        checkOut: { type: 'string', description: 'Check-out date (YYYY-MM-DD)' },
        guests: { type: 'number', description: 'Number of guests' },
      },
      required: ['checkIn', 'checkOut'],
    },
  },
  {
    name: 'create_booking',
    description: 'Create a new booking',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'number', description: 'Room ID' },
        checkIn: { type: 'string', description: 'Check-in date' },
        checkOut: { type: 'string', description: 'Check-out date' },
        guestName: { type: 'string', description: 'Guest full name' },
        guestEmail: { type: 'string', description: 'Guest email' },
        guestPhone: { type: 'string', description: 'Guest phone' },
      },
      required: ['roomId', 'checkIn', 'checkOut', 'guestName', 'guestEmail'],
    },
  },
  {
    name: 'get_booking',
    description: 'Get booking details by ID',
    inputSchema: {
      type: 'object',
      properties: {
        bookingId: { type: 'number', description: 'Booking ID' },
      },
      required: ['bookingId'],
    },
  },
  {
    name: 'cancel_booking',
    description: 'Cancel a booking',
    inputSchema: {
      type: 'object',
      properties: {
        bookingId: { type: 'number', description: 'Booking ID' },
      },
      required: ['bookingId'],
    },
  },
]

// Tool implementations
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  check_availability: async ({ checkIn, checkOut, guests = 2 }) => {
    const available = await prisma.room.findMany({
      where: {
        status: 'available',
        roomType: {
          capacity: { gte: guests },
        },
        NOT: {
          bookings: {
            some: {
              status: { not: 'cancelled' },
              OR: [
                { checkIn: { lt: new Date(checkOut) } },
                { checkOut: { gt: new Date(checkIn) } },
              ],
            },
          },
        },
      },
      include: {
        roomType: true,
      },
    })
    return {
      success: true,
      count: available.length,
      rooms: available.map((r) => ({
        id: r.id,
        number: r.roomNumber,
        type: r.roomType.name,
        price: r.roomType.basePrice,
      })),
    }
  },

  create_booking: async ({ roomId, checkIn, checkOut, guestName, guestEmail, guestPhone }) => {
    const nameParts = guestName.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || 'Guest'

    // Find or create guest
    let guest = await prisma.guest.findUnique({
      where: { email: guestEmail },
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          email: guestEmail,
          firstName,
          lastName,
          phone: guestPhone,
        },
      })
    }

    // Get room price
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true },
    })

    if (!room) throw new Error('Room not found')

    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
    const total = room.roomType.basePrice * nights

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        guestId: guest.id,
        roomId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalAmount: total,
        status: 'confirmed',
        paymentStatus: 'unpaid',
      },
    })

    return {
      success: true,
      bookingId: booking.id,
      total,
      nights,
    }
  },

  get_booking: async ({ bookingId }) => {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: {
          include: { roomType: true },
        },
      },
    })
    if (!booking) throw new Error('Booking not found')
    return {
      success: true,
      booking: {
        id: booking.id,
        guest: `${booking.guest.firstName} ${booking.guest.lastName}`,
        room: booking.room.roomNumber,
        roomType: booking.room.roomType.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        total: booking.totalAmount,
        status: booking.status,
      },
    }
  },

  cancel_booking: async ({ bookingId }) => {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    })
    return {
      success: true,
      bookingId: booking.id,
      status: 'cancelled',
    }
  },
}

// Create MCP server
const server = new Server(
  {
    name: 'hotel-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}))

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (!name || typeof name !== 'string') {
    throw new Error('Tool name is required')
  }

  const handler = toolHandlers[name]
  if (!handler) {
    throw new Error(`Tool not found: ${name}`)
  }

  try {
    const result = await handler(args || {})
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result),
        },
      ],
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }),
        },
      ],
      isError: true,
    }
  }
})

// Start server
export function startMCPServer() {
  const transport = new StdioServerTransport()
  server.connect(transport)
  console.error('MCP Server running on stdio')
}

// For use in Next.js API routes
export async function callMCPTool(toolName: string, args: any) {
  const handler = toolHandlers[toolName]
  if (!handler) {
    throw new Error(`Tool not found: ${toolName}`)
  }
  return handler(args)
}