"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Booking {
  id: number
  checkIn: string
  checkOut: string
  totalAmount: number
  status: string
  room: {
    roomNumber: string
    roomType: {
      name: string
    }
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch guest's bookings from API
    // For now, show a placeholder
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return <div className="text-center py-20">Loading your bookings...</div>
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary">My Bookings</h1>
        <p className="text-on-surface-variant">View and manage your upcoming stays</p>
      </header>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-6">calendar_month</span>
          <h2 className="font-headline-md text-headline-md text-primary mb-4">No Bookings Yet</h2>
          <p className="text-on-surface-variant mb-8">Start your journey with us by booking your first stay.</p>
          <Link href="/rooms" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md hover:opacity-90">
            Browse Rooms
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-title-lg text-primary">Room {booking.room.roomNumber}</h3>
                  <p className="text-on-surface-variant">{booking.room.roomType.name}</p>
                  <p className="text-on-surface-variant text-sm">
                    {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-label-md text-secondary">${booking.totalAmount.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded font-label-sm text-[10px] uppercase tracking-wide ${
                    booking.status === "confirmed" ? "bg-[#E8F5E9] text-[#2E7D32]" :
                    booking.status === "checked_in" ? "bg-[#E3F2FD] text-[#1565C0]" :
                    booking.status === "cancelled" ? "bg-error-container text-on-error-container" :
                    "bg-[#FFF8E1] text-[#F57C00]"
                  }`}>
                    {booking.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}