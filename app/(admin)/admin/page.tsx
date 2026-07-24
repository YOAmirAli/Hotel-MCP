"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Stats {
  totalRegistrations: number
  pendingRegistrations: number
  approvedHotels: number
  totalUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

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

  if (loading) {
    return <div className="text-center py-20">Loading dashboard...</div>
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="font-display-lg text-primary">Admin Dashboard</h2>
        <p className="text-on-surface-variant">Manage hotels, registrations, and users</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30">
          <p className="text-on-surface-variant font-label-sm">Total Registrations</p>
          <p className="font-display-lg text-3xl text-primary">{stats?.totalRegistrations || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 border-l-4 border-secondary">
          <p className="text-on-surface-variant font-label-sm">Pending</p>
          <p className="font-display-lg text-3xl text-secondary">{stats?.pendingRegistrations || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 border-l-4 border-[#386a20]">
          <p className="text-on-surface-variant font-label-sm">Approved Hotels</p>
          <p className="font-display-lg text-3xl text-[#386a20]">{stats?.approvedHotels || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30">
          <p className="text-on-surface-variant font-label-sm">Total Users</p>
          <p className="font-display-lg text-3xl text-primary">{stats?.totalUsers || 0}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-6">
        <h3 className="font-title-lg text-primary mb-4">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/admin/registrations"
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90"
          >
            Review Registrations
          </Link>
          <Link
            href="/admin/hotels"
            className="px-6 py-3 border border-primary text-primary rounded-lg font-label-md hover:bg-primary hover:text-on-primary transition-all"
          >
            Manage Hotels
          </Link>
        </div>
      </div>
    </div>
  )
}