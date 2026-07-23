"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hotelId, setHotelId] = useState<number | null>(null)

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
      setHotelId(payload.hotelId)
    } catch {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-64 bg-primary-container shadow-xl flex flex-col py-6 z-40">
        <div className="px-6 mb-8">
          <h1 className="font-headline-sm text-headline-sm text-on-primary">Manager Sanaullah Portal</h1>
          <p className="font-label-md text-label-md text-on-primary-container/70">Hotel Management</p>
        </div>
        <nav className="flex-1">
          <Link href="/manager" className="flex items-center gap-3 px-6 py-3 text-on-primary/70 hover:bg-surface-container-highest/5 hover:text-on-primary transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </Link>
          <Link href="/manager/rooms" className="flex items-center gap-3 px-6 py-3 text-on-primary/70 hover:bg-surface-container-highest/5 hover:text-on-primary transition-all">
            <span className="material-symbols-outlined">bed</span>
            <span className="font-label-md text-label-md">Rooms</span>
          </Link>
          <Link href="/manager/bookings" className="flex items-center gap-3 px-6 py-3 text-on-primary/70 hover:bg-surface-container-highest/5 hover:text-on-primary transition-all">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-md text-label-md">Bookings</span>
          </Link>
          <Link href="/manager/hotel-profile" className="flex items-center gap-3 px-6 py-3 text-on-primary/70 hover:bg-surface-container-highest/5 hover:text-on-primary transition-all">
            <span className="material-symbols-outlined">hotel</span>
            <span className="font-label-md text-label-md">Hotel Profile</span>
          </Link>
        </nav>
        <div className="border-t border-white/10 pt-4 px-6">
          <button
            onClick={() => {
              localStorage.removeItem('token')
              router.push('/login')
            }}
            className="flex items-center gap-3 text-on-primary-container/70 hover:text-on-primary transition-all w-full py-2"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 min-h-screen p-8">{children}</main>
    </div>
  )
}