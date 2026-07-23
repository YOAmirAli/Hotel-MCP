"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import RoomCard from "@/components/guest/RoomCard"

interface Room {
  id: number
  roomNumber: string
  floor: number
  status: string
  roomType: {
    id: number
    name: string
    description: string
    basePrice: number
    capacity: number
    amenities: string[]
    imageUrl: string | null
  }
  pricePerNight: number
  totalPrice: number
  nights: number
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
  })
  const [checkOut, setCheckOut] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date.toISOString().split('T')[0]
  })
  const [guests, setGuests] = useState(2)

  useEffect(() => {
    fetchRooms()
  }, [checkIn, checkOut, guests])

  async function fetchRooms() {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/rooms/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
      )
      const data = await res.json()
      if (data.success) {
        setRooms(data.data)
      } else {
        setRooms([])
      }
    } catch (error) {
      console.error(error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Filter Bar */}
      <section className="mb-12">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Check‑in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 font-label-md focus:border-secondary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Check‑out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 font-label-md focus:border-secondary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 font-label-md focus:border-secondary transition-colors"
              >
                <option value="1">1 Adult</option>
                <option value="2">2 Adults</option>
                <option value="3">3 Adults</option>
                <option value="4">4 Adults</option>
              </select>
            </div>
            <button
              onClick={fetchRooms}
              className="w-full bg-secondary text-on-primary py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">tune</span> Apply Filters
            </button>
          </div>
        </div>
      </section>

      {/* Room Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden">
              <div className="skeleton-pulse aspect-[4/3] w-full" />
              <div className="p-6 space-y-4">
                <div className="skeleton-pulse h-6 w-3/4 rounded" />
                <div className="skeleton-pulse h-4 w-1/2 rounded" />
                <div className="flex gap-4 py-2 border-y">
                  <div className="skeleton-pulse h-4 w-12 rounded" />
                  <div className="skeleton-pulse h-4 w-12 rounded" />
                </div>
                <div className="skeleton-pulse h-12 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="py-32 text-center max-w-md mx-auto">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-6">bed</span>
          <h2 className="font-headline-md text-headline-md text-primary mb-4">No Rooms Available</h2>
          <p className="text-on-surface-variant mb-8">Try adjusting your dates or number of guests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              roomNumber={room.roomNumber}
              floor={room.floor}
              roomType={room.roomType}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              pricePerNight={room.pricePerNight}
              totalPrice={room.totalPrice}
              nights={room.nights}
            />
          ))}
        </div>
      )}
    </div>
  )
}