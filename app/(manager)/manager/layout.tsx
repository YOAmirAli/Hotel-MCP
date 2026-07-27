"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', href: '/manager', icon: 'dashboard' },
  { label: 'Rooms', href: '/manager/rooms', icon: 'bed' },
  { label: 'Bookings', href: '/manager/bookings', icon: 'calendar_month' },
  { label: 'Hotel Profile', href: '/manager/hotel-profile', icon: 'hotel' },
]

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hotelName, setHotelName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'hotel_manager' && payload.role !== 'admin') {
        router.push('/')
      }
      setHotelName(payload.hotelName || 'Hotel Manager')
    } catch {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-on-surface-variant">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 bg-primary text-on-primary shadow-2xl flex flex-col py-6 z-40">
        <div className="px-6 mb-8">
          <div className="font-display-lg text-2xl text-on-primary">LuxeStay</div>
          <p className="text-sm text-on-primary/70 mt-1">{hotelName}</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-primary/60 hover:bg-on-primary/5 hover:text-on-primary transition-all"
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-on-primary/10 pt-4 px-6">
          <button
            onClick={() => {
              localStorage.removeItem('token')
              document.cookie = 'token=; path=/; max-age=0'
              router.push('/login')
            }}
            className="flex items-center gap-3 text-on-primary/60 hover:text-on-primary transition-all w-full py-2"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 min-h-screen p-8 bg-surface-container-low">
        {children}
      </main>
    </div>
  )
}