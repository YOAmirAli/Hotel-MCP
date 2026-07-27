"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Hotel {
  id: number
  name: string
  description: string
  city: string
  country?: string        
  address: string
  status: string
  imageUrl: string
  roomTypes: { id: number; name: string }[]
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: 'Islamabad',
    country: 'Pakistan',
    phone: '',
    email: '',
    imageUrl: '',
  })

  useEffect(() => {
    fetchHotels()
  }, [])

  async function fetchHotels() {
    try {
      const res = await fetch('/api/admin/hotels', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setHotels(data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddHotel(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...form, status: 'approved' }),
      })
      const data = await res.json()
      if (data.success) {
        setShowForm(false)
        setForm({ name: '', description: '', address: '', city: 'Islamabad', country: 'Pakistan', phone: '', email: '', imageUrl: '' })
        await fetchHotels()
      } else {
        alert(data.error)
      }
    } catch {
      alert('Failed to add hotel')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Hotels</h2>
          <p className="text-on-surface-variant">Manage all hotels on the platform</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-all"
        >
          {showForm ? 'Cancel' : '+ Add Hotel'}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 mb-6">
          <h3 className="font-title-lg text-title-lg text-primary mb-4">Add New Hotel</h3>
          <form onSubmit={handleAddHotel} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Hotel Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                  readOnly
                />
                <p className="text-xs text-on-surface-variant mt-1">Only Islamabad hotels are allowed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                placeholder="https://..."
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {saving ? 'Adding...' : 'Add Hotel'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 bg-cover bg-center" style={{ backgroundImage: hotel.imageUrl ? `url(${hotel.imageUrl})` : 'url(https://picsum.photos/seed/hotel/400/300)' }} />
            <div className="p-6">
              <h3 className="font-title-lg text-primary">{hotel.name}</h3>
              <p className="text-sm text-on-surface-variant">{hotel.address}</p>
              <p className="text-sm text-on-surface-variant">{hotel.city}, {hotel.country}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  hotel.status === 'approved' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                  hotel.status === 'pending' ? 'bg-[#FFF8E1] text-[#F57C00]' :
                  'bg-error-container text-on-error-container'
                }`}>
                  {hotel.status}
                </span>
                <Link
                  href={`/admin/hotels/${hotel.id}/rooms`}
                  className="text-sm text-secondary hover:underline"
                >
                  Manage Rooms →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}