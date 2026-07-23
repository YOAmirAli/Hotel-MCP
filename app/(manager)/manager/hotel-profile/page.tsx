"use client"

import { useState, useEffect } from 'react'

export default function HotelProfile() {
  const [hotel, setHotel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
  })

  useEffect(() => {
    fetchHotel()
  }, [])

  async function fetchHotel() {
    try {
      const res = await fetch('/api/manager/hotel', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setHotel(data.data)
        setFormData({
          name: data.data.name || '',
          description: data.data.description || '',
          address: data.data.address || '',
          city: data.data.city || '',
          country: data.data.country || '',
          phone: data.data.phone || '',
          email: data.data.email || '',
          website: data.data.website || '',
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/manager/hotel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        alert('Hotel profile updated successfully!')
      } else {
        alert(data.error || 'Failed to update profile')
      }
    } catch (error) {
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading hotel profile...</div>
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">Hotel Profile</h2>
        <p className="text-on-surface-variant">Complete your hotel listing details</p>
      </header>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-label-md text-on-surface-variant">Hotel Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              required
            />
          </div>

          <div>
            <label className="font-label-md text-on-surface-variant">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-on-surface-variant">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              />
            </div>
            <div>
              <label className="font-label-md text-on-surface-variant">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              />
            </div>
            <div>
              <label className="font-label-md text-on-surface-variant">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              />
            </div>
            <div>
              <label className="font-label-md text-on-surface-variant">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              />
            </div>
            <div>
              <label className="font-label-md text-on-surface-variant">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              />
            </div>
            <div>
              <label className="font-label-md text-on-surface-variant">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/30">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}