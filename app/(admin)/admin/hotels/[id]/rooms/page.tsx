"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface RoomType {
  id: number
  name: string
  basePrice: number
  capacity: number
  imageUrl: string
}

export default function AdminHotelRoomsPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = parseInt(params.id as string)
  
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    basePrice: '',
    capacity: '2',
    description: '',
    imageUrl: '',
  })
  const [roomNumber, setRoomNumber] = useState('')
  const [floor, setFloor] = useState('1')

  useEffect(() => {
    fetchRooms()
  }, [hotelId])

  async function fetchRooms() {
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/rooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setRoomTypes(data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRoomType(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...form,
          basePrice: parseFloat(form.basePrice),
          capacity: parseInt(form.capacity),
          roomNumber,
          floor: parseInt(floor),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowForm(false)
        setForm({ name: '', basePrice: '', capacity: '2', description: '', imageUrl: '' })
        setRoomNumber('')
        setFloor('1')
        await fetchRooms()
      } else {
        alert(data.error)
      }
    } catch {
      alert('Failed to add room')
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
          <button onClick={() => router.back()} className="text-secondary hover:underline text-sm mb-2 block">← Back</button>
          <h2 className="font-headline-md text-headline-md text-primary">Rooms</h2>
          <p className="text-on-surface-variant">Add and manage rooms for this hotel</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-all"
        >
          {showForm ? 'Cancel' : '+ Add Room'}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 mb-6">
          <h3 className="font-title-lg text-title-lg text-primary mb-4">Add New Room</h3>
          <form onSubmit={handleAddRoomType} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Room Type Name *</label>
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
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Base Price (PKR) *</label>
                <input
                  type="number"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Capacity *</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Room Number *</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Floor</label>
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                  min="1"
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
              {saving ? 'Adding...' : 'Add Room'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.map((rt) => (
          <div key={rt.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
            <div className="h-40 bg-cover bg-center" style={{ backgroundImage: rt.imageUrl ? `url(${rt.imageUrl})` : 'url(https://picsum.photos/seed/room/400/300)' }} />
            <div className="p-6">
              <h3 className="font-title-lg text-primary">{rt.name}</h3>
              <p className="text-sm text-on-surface-variant">Rs. {rt.basePrice}/night</p>
              <p className="text-sm text-on-surface-variant">Capacity: {rt.capacity} guests</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}