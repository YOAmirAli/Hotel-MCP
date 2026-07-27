import { prisma } from '@/lib/db/prisma'

export const mcpTools = {
  // Check availability
  checkAvailability: async (checkIn: string, checkOut: string, guests: number = 2) => {
    const rooms = await prisma.room.findMany({
      where: {
        status: 'available',
        roomType: {
          capacity: { gte: guests },
          hotel: { status: 'approved' },
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
        roomType: {
          include: { hotel: true },
        },
      },
    })
    return rooms
  },

  // Create booking
  createBooking: async (data: {
    roomId: number
    checkIn: string
    checkOut: string
    guestName: string
    guestEmail: string
    guestPhone?: string
  }) => {
    const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone } = data
    const nameParts = guestName.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || 'Guest'

    // Find or create guest
    let guest = await prisma.guest.findUnique({ where: { email: guestEmail } })
    if (!guest) {
      guest = await prisma.guest.create({
        data: { email: guestEmail, firstName, lastName, phone: guestPhone },
      })
    }

    // Get room with price
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true },
    })
    if (!room) throw new Error('Room not found')

    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
    const total = room.roomType.basePrice * (nights > 0 ? nights : 1)

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

    return { bookingId: booking.id, total, nights }
  },

  // Cancel booking
  cancelBooking: async (bookingId: number) => {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    })
    return { bookingId: booking.id, status: booking.status }
  },

  // Get booking details
  getBooking: async (bookingId: number) => {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: { include: { roomType: true } },
      },
    })
    if (!booking) throw new Error('Booking not found')
    return {
      id: booking.id,
      guest: `${booking.guest.firstName} ${booking.guest.lastName}`,
      room: booking.room.roomNumber,
      roomType: booking.room.roomType.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      total: booking.totalAmount,
      status: booking.status,
    }
  },
}