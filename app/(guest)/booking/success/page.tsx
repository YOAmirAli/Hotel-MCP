"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import WhatsAppButton from "@/components/WhatsAppButton"

interface BookingDetails {
  id: number
  guest: {
    firstName: string
    lastName: string
    phone?: string
  }
  room: {
    roomNumber: string
    roomType: {
      name: string
      hotel: {
        name: string
      }
    }
  }
  checkIn: string
  checkOut: string
  totalAmount: number
  status: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)

  useEffect(() => {
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setBookingDetails(data.data)
        })
        .catch((error: unknown) => console.error('Error fetching booking:', error))
    }
  }, [bookingId])

  const guestName = bookingDetails?.guest?.firstName + ' ' + bookingDetails?.guest?.lastName || 'Guest'
  const hotelName = bookingDetails?.room?.roomType?.hotel?.name || 'LuxeStay'
  const roomName = bookingDetails?.room?.roomType?.name || 'Room'
  const checkIn = bookingDetails?.checkIn ? new Date(bookingDetails.checkIn).toLocaleDateString() : 'N/A'
  const checkOut = bookingDetails?.checkOut ? new Date(bookingDetails.checkOut).toLocaleDateString() : 'N/A'
  const total = bookingDetails?.totalAmount || 0

  // Manager's WhatsApp number (replace with actual)
  const managerPhone = "923001234567"

  const whatsappMessage = `
🏨 *New Booking Confirmation*

👤 Guest: ${guestName}
🏠 Hotel: ${hotelName}
🛏 Room: ${roomName}
📅 Check-in: ${checkIn}
📅 Check-out: ${checkOut}
💰 Total: Rs. ${total}

Booking ID: #${bookingId}

Thank you for choosing LuxeStay!
  `.trim()

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-10 text-center py-20">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-full mx-auto mb-6">
        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>
      <h2 className="font-display-lg text-3xl text-primary mb-4">Booking Confirmed! 🎉</h2>
      <p className="text-on-surface-variant mb-4">
        Your sanctuary awaits at <strong>{hotelName}</strong>.
        {bookingId && (
          <>
            <br />
            <span className="text-sm">Booking Reference: <strong>#{bookingId}</strong></span>
          </>
        )}
      </p>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 text-left">
        <h3 className="font-semibold text-primary mb-3">Booking Summary</h3>
        <div className="space-y-1 text-sm">
          <p><span className="text-on-surface-variant">Guest:</span> <strong>{guestName}</strong></p>
          <p><span className="text-on-surface-variant">Room:</span> <strong>{roomName}</strong></p>
          <p><span className="text-on-surface-variant">Check-in:</span> <strong>{checkIn}</strong></p>
          <p><span className="text-on-surface-variant">Check-out:</span> <strong>{checkOut}</strong></p>
          <p><span className="text-on-surface-variant">Total:</span> <strong className="text-emerald-600">Rs. {total}</strong></p>
        </div>
      </div>

      <WhatsAppButton
        phoneNumber={managerPhone}
        message={whatsappMessage}
        className="w-full justify-center text-lg"
      >
        📱 Send Confirmation via WhatsApp
      </WhatsAppButton>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/"
          className="inline-block text-on-surface-variant hover:text-primary transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}