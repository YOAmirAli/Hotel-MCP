"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ImageUpload from '@/components/ui/ImageUpload'

interface RoomType {
  id: number
  name: string
  basePrice: number
  capacity: number
  imageUrl?: string
  rooms: { id: number; roomNumber: string; floor: number; status: string }[]
}

export default function ManagerRoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    basePrice: '',
    capacity: '2',
    roomNumber: '',
    floor: '1',
    imageUrl: '',
  })

  async function loadRoomTypes() {
    setLoading(true)
    try {
      const res = await fetch('/api/manager/room-types', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      if (data.success) {
        setRoomTypes(data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoomTypes()
  }, [])

  async function handleAddRoomType(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const rtRes = await fetch('/api/manager/room-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: form.name,
          basePrice: Number(form.basePrice),
          capacity: Number(form.capacity),
          imageUrl: form.imageUrl,
        }),
      })
      const rtData = await rtRes.json()
      if (!rtRes.ok) throw new Error(rtData.error)

      // If room number provided, add a room under this type
      if (form.roomNumber) {
        await fetch('/api/manager/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            roomTypeId: rtData.data.id,
            roomNumber: form.roomNumber,
            floor: Number(form.floor),
            status: 'available',
          }),
        })
      }

      setShowForm(false)
      setForm({ name: '', basePrice: '', capacity: '2', roomNumber: '', floor: '1', imageUrl: '' })
      await loadRoomTypes()
    } catch (error) {
      alert('Failed to create room type')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-20">Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">My Rooms</h2>
          <p className="text-on-surface-variant">Add and manage room types for your hotel.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-all"
        >
          {showForm ? 'Cancel' : 'Add Room Type'}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 mb-6">
          <h3 className="font-title-lg text-title-lg text-primary mb-4">New Room Type</h3>
          <form onSubmit={handleAddRoomType} className="space-y-4 max-w-xl">
            <div>
              <label className="font-label-md text-on-surface-variant">Room Type Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-on-surface-variant">Base Price ($) *</label>
                <input
                  type="number"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">Capacity *</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  required
                  min="1"
                />
              </div>
            </div>
            <ImageUpload
              label="Room Image (will show for all rooms of this type)"
              folder="rooms"
              onUpload={(url) => setForm({ ...form, imageUrl: url })}
            />
            <p className="text-sm text-on-surface-variant">Optional: add first room unit</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-on-surface-variant">Room Number</label>
                <input
                  type="text"
                  value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">Floor</label>
                <input
                  type="number"
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {roomTypes.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 text-center rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">bed</span>
          <p className="text-on-surface-variant">No room types yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {roomTypes.map((rt) => (
            <div key={rt.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-title-lg text-title-lg text-primary">{rt.name}</h3>
                  <p className="text-on-surface-variant text-sm">${rt.basePrice}/night · Capacity: {rt.capacity}</p>
                </div>
                {rt.imageUrl && (
                  <div className="w-16 h-16 rounded overflow-hidden">
                    <img src={rt.imageUrl} alt={rt.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              {rt.rooms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {rt.rooms.map((room) => (
                    <span key={room.id} className="px-3 py-1 bg-surface-container-low rounded-full text-xs">
                      #{room.roomNumber} (Floor {room.floor}) — {room.status}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}