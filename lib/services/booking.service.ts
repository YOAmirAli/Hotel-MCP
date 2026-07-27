import { prisma } from '@/lib/db/prisma'
import { WhatsAppService } from './whatsapp.service'
import { PaymentService } from './payment.service'

export class BookingService {
  /**
   * Check available rooms for a given date range and guest count
   */
  static async checkAvailability({
    checkIn,
    checkOut,
    guests = 2,
    city = 'Islamabad',
  }: {
    checkIn: string
    checkOut: string
    guests?: number
    city?: string
  }) {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new Error('Check-in date must be before check-out date')
    }
    if (checkInDate < new Date()) {
      throw new Error('Check-in date must be in the future')
    }

    // Find available rooms
    const availableRooms = await prisma.$transaction(async (tx) => {
      // Get booked room IDs for the date range
      const bookedRoomIds = await tx.booking.findMany({
        where: {
          OR: [
            {
              checkIn: { lt: checkOutDate },
              checkOut: { gt: checkInDate },
            },
          ],
          status: { not: 'cancelled' },
        },
        select: { roomId: true },
        distinct: ['roomId'],
      })

      const occupiedRoomIds = bookedRoomIds.map((b) => b.roomId)

      // Get available rooms
      const rooms = await tx.room.findMany({
        where: {
          id: { notIn: occupiedRoomIds.length > 0 ? occupiedRoomIds : [0] },
          status: 'available',
          roomType: {
            hotel: {
              city: city,
              status: 'approved',
            },
            capacity: { gte: guests },
          },
        },
        include: {
          roomType: {
            include: {
              hotel: true,
            },
          },
        },
      })

      return rooms
    })

    // Calculate pricing
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return availableRooms.map((room) => {
      const basePrice = room.roomType.basePrice
      // Simple dynamic pricing: weekends +10%
      let total = 0
      const current = new Date(checkInDate) // <-- FIXED: let → const
      while (current < checkOutDate) {
        const dayOfWeek = current.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const price = isWeekend ? basePrice * 1.1 : basePrice
        total += price
        current.setDate(current.getDate() + 1)
      }

      return {
        ...room,
        pricePerNight: basePrice,
        totalPrice: total,
        nights,
      }
    })
  }

  /**
   * Create a new booking with payment intent
   */
  static async createBooking(data: {
    guestEmail: string
    guestFirstName: string
    guestLastName: string
    guestPhone?: string
    roomId: number
    checkIn: Date
    checkOut: Date
    guests: number
  }) {
    const {
      guestEmail,
      guestFirstName,
      guestLastName,
      guestPhone,
      roomId,
      checkIn,
      checkOut,
    } = data

    // Validate dates
    if (checkIn >= checkOut) {
      throw new Error('Check-in must be before check-out')
    }
    if (checkIn < new Date()) {
      throw new Error('Check-in must be in the future')
    }

    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Lock and get room
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: {
          roomType: {
            include: {
              hotel: true,
            },
          },
        },
      })

      if (!room) {
        throw new Error('Room not found')
      }
      if (room.status === 'occupied') {
        throw new Error('Room is currently occupied')
      }

      // Check for overlapping bookings
      const overlapping = await tx.booking.findFirst({
        where: {
          roomId,
          status: { not: 'cancelled' },
          OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }],
        },
      })

      if (overlapping) {
        throw new Error('Room is already booked for these dates')
      }

      // Calculate total price
      const basePrice = room.roomType.basePrice

      let total = 0
      const current = new Date(checkIn) // <-- FIXED: let → const
      while (current < checkOut) {
        const dayOfWeek = current.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const price = isWeekend ? basePrice * 1.1 : basePrice
        total += price
        current.setDate(current.getDate() + 1)
      }

      // Find or create guest
      let guest = await tx.guest.findUnique({
        where: { email: guestEmail },
      })

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            email: guestEmail,
            firstName: guestFirstName,
            lastName: guestLastName,
            phone: guestPhone,
          },
        })
      }

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          guestId: guest.id,
          roomId,
          checkIn,
          checkOut,
          totalAmount: total,
          status: 'pending',
          paymentStatus: 'unpaid',
        },
        include: {
          guest: true,
          room: {
            include: {
              roomType: {
                include: {
                  hotel: true,
                },
              },
            },
          },
        },
      })

      // Create Stripe Payment Intent
      const payment = await PaymentService.createPaymentIntent(total, 'pkr', {
        bookingId: String(newBooking.id),
        guestEmail,
      })

      // Save payment record
      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          stripePaymentIntentId: payment.paymentIntentId,
          amount: total,
          status: 'pending',
        },
      })

      return {
        booking: newBooking,
        clientSecret: payment.clientSecret,
        paymentIntentId: payment.paymentIntentId,
      }
    })

    // Send WhatsApp confirmation (don't await - fire and forget)
    try {
      if (result.booking.guest.phone) {
        await WhatsAppService.sendBookingConfirmation(
          result.booking.guest.phone,
          {
            bookingId: result.booking.id,
            hotelName: result.booking.room.roomType.hotel.name,
            roomType: result.booking.room.roomType.name,
            roomNumber: result.booking.room.roomNumber,
            checkIn: checkIn.toISOString().split('T')[0],
            checkOut: checkOut.toISOString().split('T')[0],
            totalAmount: result.booking.totalAmount,
            guestName: `${result.booking.guest.firstName} ${result.booking.guest.lastName}`,
          }
        )
      }
    } catch (whatsappError) {
      console.error('WhatsApp notification failed:', whatsappError)
      // Don't fail booking if WhatsApp fails
    }

    return result
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: {
          include: {
            roomType: {
              include: {
                hotel: true,
              },
            },
          },
        },
      },
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled')
    }

    // Check if booking can be cancelled (e.g., not checked in)
    if (booking.status === 'checked_in') {
      throw new Error('Cannot cancel a checked-in booking')
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    })

    return cancelledBooking
  }

  /**
   * Get booking details with guest and room info
   */
  static async getBooking(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: {
          include: {
            roomType: {
              include: {
                hotel: true,
              },
            },
          },
        },
        payments: true,
      },
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    return booking
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(bookingId: number, status: string) {
    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status')
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    })

    return booking
  }

  /**
   * Get guest bookings
   */
  static async getGuestBookings(guestId: number) {
    const bookings = await prisma.booking.findMany({
      where: { guestId },
      include: {
        room: {
          include: {
            roomType: {
              include: {
                hotel: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return bookings
  }

  /**
   * Check if room is available for specific dates
   */
  static async isRoomAvailable(roomId: number, checkIn: Date, checkOut: Date) {
    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { not: 'cancelled' },
        OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }],
      },
    })

    return !overlapping
  }
}