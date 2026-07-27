"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface FeaturedRoom {
  id: number
  roomNumber: string
  floor: number
  roomType: {
    id: number
    name: string
    basePrice: number
    capacity: number
    imageUrl: string | null
    hotel: {
      id: number
      name: string
      imageUrl: string | null
    }
  }
}

export default function HomePage() {
  const [rooms, setRooms] = useState<FeaturedRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedRooms()
  }, [])

  async function fetchFeaturedRooms() {
    try {
      const res = await fetch('/api/rooms/featured')
      const data = await res.json()
      if (data.success) {
        setRooms(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format price in PKR
  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('PKR', 'Rs.')
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop')"
          }}
        />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <h1 className="font-display-lg text-white text-5xl md:text-7xl mb-6 leading-tight">
            Your Private Sanctuary <br /> <span className="italic">in the Heart of the City</span>
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-12">
            Discover an unparalleled blend of editorial design and legendary service at LuxeStay.
          </p>
          <Link
            href="/rooms"
            className="bg-white text-primary px-10 py-4 rounded-lg font-semibold text-sm uppercase tracking-widest hover:bg-opacity-90 transition-all"
          >
            Explore Rooms
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-secondary uppercase tracking-[0.3em]">The LuxeStay Standard</span>
          <h2 className="font-display-lg text-3xl md:text-5xl mt-4 text-primary">Elegance in Every Detail</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: "diamond", title: "Uncompromising Luxury", desc: "From Egyptian cotton linens to hand‑selected artwork." },
            { icon: "location_on", title: "Prime Destinations", desc: "Strategically located in the cultural heartbeat of the city." },
            { icon: "temp_preferences_custom", title: "Intuitive Service", desc: "Our concierge team anticipates your needs before you do." },
          ].map((item) => (
            <div key={item.title} className="group p-8 border border-transparent hover:border-outline-variant/30 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-secondary mb-6 block">{item.icon}</span>
              <h3 className="text-2xl mb-4 text-primary">{item.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms - Now showing REAL hotels from database */}
      <section className="bg-surface-container-low py-24 overflow-hidden">
        <div className="px-4 md:px-10 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-sm font-semibold text-secondary uppercase tracking-[0.3em]">The Collection</span>
              <h2 className="font-display-lg text-3xl md:text-5xl mt-4 text-primary">Featured Residences</h2>
            </div>
            <Link href="/rooms" className="text-secondary font-medium hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white shadow-sm rounded-xl overflow-hidden">
                  <div className="skeleton-pulse h-[300px] w-full" />
                  <div className="p-8 space-y-4">
                    <div className="skeleton-pulse h-6 w-3/4 rounded" />
                    <div className="skeleton-pulse h-4 w-1/2 rounded" />
                    <div className="skeleton-pulse h-12 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">hotel</span>
              <p className="text-on-surface-variant">No hotels have been registered yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <div key={room.id} className="bg-white shadow-sm group rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-[300px] overflow-hidden bg-surface-container-highest">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                      style={{
                        backgroundImage: room.roomType.imageUrl
                          ? `url(${room.roomType.imageUrl})`
                          : `url('https://picsum.photos/seed/${room.roomType.name.replace(/\s/g, '')}${room.id}/800/600')`
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 text-sm font-medium text-primary uppercase rounded">
                      From {formatPrice(room.roomType.basePrice)}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl mb-1 text-primary">{room.roomType.name}</h3>
                    <p className="text-sm text-on-surface-variant mb-2">{room.roomType.hotel.name}</p>
                    <div className="flex gap-4 text-on-surface-variant mb-6 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">bed</span> Room {room.roomNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">floor</span> Floor {room.floor}
                      </span>
                    </div>
                    <Link
                      href={`/rooms?room=${room.id}`}
                      className="w-full py-4 border border-primary text-primary font-semibold text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all block text-center rounded-lg"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}