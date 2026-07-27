"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ManagerStats {
  hotelName: string
  totalRooms: number
  availableRooms: number
  totalBookings: number
  pendingBookings: number
  status: string
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<ManagerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/manager/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="font-display-lg text-4xl text-primary">Manager Dashboard</h2>
        <p className="text-on-surface-variant mt-1">
          {stats?.status === 'approved' ? 'Manage your hotel and rooms' : 'Complete your profile to get started'}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm">
          <p className="text-on-surface-variant text-sm font-medium">Total Rooms</p>
          <p className="font-display-lg text-3xl text-primary mt-1">{stats?.totalRooms || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-[#386a20] shadow-sm">
          <p className="text-on-surface-variant text-sm font-medium">Available</p>
          <p className="font-display-lg text-3xl text-[#386a20] mt-1">{stats?.availableRooms || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary shadow-sm">
          <p className="text-on-surface-variant text-sm font-medium">Total Bookings</p>
          <p className="font-display-lg text-3xl text-secondary mt-1">{stats?.totalBookings || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary-fixed shadow-sm">
          <p className="text-on-surface-variant text-sm font-medium">Pending</p>
          <p className="font-display-lg text-3xl text-secondary-fixed mt-1">{stats?.pendingBookings || 0}</p>
        </div>
      </div>

      {stats?.status !== 'approved' && (
        <div className="bg-secondary-fixed/20 border border-secondary-fixed/30 rounded-xl p-6">
          <h3 className="font-title-lg text-primary mb-2">Complete Your Profile</h3>
          <p className="text-on-surface-variant mb-4">
            Your hotel needs to be approved by admin before you can manage rooms and bookings.
          </p>
          <Link
            href="/manager/hotel-profile"
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-all"
          >
            Complete Hotel Profile
          </Link>
        </div>
      )}
    </div>
  )
}