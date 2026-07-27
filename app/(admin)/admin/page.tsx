"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Stats {
  totalRegistrations: number
  pendingRegistrations: number
  approvedHotels: number
  totalUsers: number
  totalRooms: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats', {
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
    fetchStats()
  }, [])

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
        <h2 className="font-display-lg text-4xl text-primary">Admin Dashboard</h2>
        <p className="text-on-surface-variant mt-1">Manage hotels, registrations, and users</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-on-surface-variant text-sm font-medium">Total Registrations</p>
          <p className="font-display-lg text-3xl text-primary mt-1">{stats?.totalRegistrations || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary shadow-sm hover:shadow-md transition-shadow">
          <p className="text-on-surface-variant text-sm font-medium">Pending</p>
          <p className="font-display-lg text-3xl text-secondary mt-1">{stats?.pendingRegistrations || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-[#386a20] shadow-sm hover:shadow-md transition-shadow">
          <p className="text-on-surface-variant text-sm font-medium">Approved Hotels</p>
          <p className="font-display-lg text-3xl text-[#386a20] mt-1">{stats?.approvedHotels || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
          <p className="text-on-surface-variant text-sm font-medium">Total Users</p>
          <p className="font-display-lg text-3xl text-primary mt-1">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary-fixed shadow-sm hover:shadow-md transition-shadow">
          <p className="text-on-surface-variant text-sm font-medium">Total Rooms</p>
          <p className="font-display-lg text-3xl text-secondary mt-1">{stats?.totalRooms || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 shadow-sm">
        <h3 className="font-title-lg text-primary mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/registrations"
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-all shadow-sm"
          >
            Review Registrations
          </Link>
          <Link
            href="/admin/hotels"
            className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-on-primary transition-all"
          >
            Manage Hotels
          </Link>
          <Link
            href="/admin/rooms"
            className="px-6 py-3 border border-secondary text-secondary rounded-lg font-medium hover:bg-secondary hover:text-on-primary transition-all"
          >
            Manage Rooms
          </Link>
        </div>
      </div>
    </div>
  )
}