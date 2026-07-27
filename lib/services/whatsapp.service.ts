import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const FROM_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER!

export class WhatsAppService {
  static async sendBookingConfirmation(toPhone: string, bookingDetails: {
    bookingId: number
    hotelName: string
    roomType: string
    roomNumber: string
    checkIn: string
    checkOut: string
    totalAmount: number
    guestName: string
  }) {
    // Skip if no phone or no Twilio credentials
    if (!toPhone || !process.env.TWILIO_ACCOUNT_SID) {
      console.log('WhatsApp skipped: No phone or Twilio credentials')
      return { success: true, skipped: true }
    }

    const message = `
🏨 *Booking Confirmed!*

👤 Guest: ${bookingDetails.guestName}
🏠 Hotel: ${bookingDetails.hotelName}
🛏 Room: ${bookingDetails.roomType} (#${bookingDetails.roomNumber})
📅 Check-in: ${bookingDetails.checkIn}
📅 Check-out: ${bookingDetails.checkOut}
💰 Total: Rs. ${bookingDetails.totalAmount.toFixed(0)}

Thank you for choosing LuxeStay!
    `.trim()

    try {
      const result = await client.messages.create({
        body: message,
        from: FROM_WHATSAPP,
        to: `whatsapp:+${toPhone.replace(/^0/, '').replace(/^\+/, '')}`,
      })
      return { success: true, messageId: result.sid }
    } catch (error) {
      console.error('WhatsApp error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async sendCheckoutBill(toPhone: string, billDetails: {
    bookingId: number
    hotelName: string
    roomType: string
    roomNumber: string
    checkIn: string
    checkOut: string
    nights: number
    roomPrice: number
    services: { name: string; price: number }[]
    totalAmount: number
    guestName: string
  }) {
    // Skip if no phone or no Twilio credentials
    if (!toPhone || !process.env.TWILIO_ACCOUNT_SID) {
      console.log('WhatsApp skipped: No phone or Twilio credentials')
      return { success: true, skipped: true }
    }

    let servicesList = ''
    if (billDetails.services.length > 0) {
      servicesList = billDetails.services.map(s => `  • ${s.name}: Rs. ${s.price.toFixed(0)}`).join('\n')
    }

    const message = `
🧾 *Checkout Bill - LuxeStay*

👤 Guest: ${billDetails.guestName}
🏠 Hotel: ${billDetails.hotelName}
🛏 Room: ${billDetails.roomType} (#${billDetails.roomNumber})
📅 Stay: ${billDetails.checkIn} to ${billDetails.checkOut}
📆 Nights: ${billDetails.nights}

*Breakdown:*
🛏 Room: Rs. ${billDetails.roomPrice.toFixed(0)}
${servicesList ? `${servicesList}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
💰 *Total: Rs. ${billDetails.totalAmount.toFixed(0)}*

Booking ID: #${billDetails.bookingId}

Thank you for staying with us!
    `.trim()

    try {
      const result = await client.messages.create({
        body: message,
        from: FROM_WHATSAPP,
        to: `whatsapp:+${toPhone.replace(/^0/, '').replace(/^\+/, '')}`,
      })
      return { success: true, messageId: result.sid }
    } catch (error) {
      console.error('WhatsApp error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}