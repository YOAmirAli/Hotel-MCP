'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface RoomType {
  id: number
  name: string
  basePrice: number
  capacity: number
  rooms: { id: number; roomNumber: string; floor: number; status: string }[]
}

export default function ManagerRoomsPage() {
  const [canManage, setCanManage] = useState(false)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', basePrice: '', capacity: '2', roomNumber: '', floor: '1' })

  async function load() {
    setLoading(true)
    try {
      const hotelRes = await fetch('/api/manager/hotel')
      const hotelData = await hotelRes.json()
      setCanManage(hotelData.canManageListing)

      if (hotelData.canManageListing) {
        const roomsRes = await fetch('/api/manager/rooms')
        const roomsData = await roomsRes.json()
        setRoomTypes(roomsData.roomTypes || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAddRoomType(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const rtRes = await fetch('/api/manager/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          basePrice: Number(form.basePrice),
          capacity: Number(form.capacity),
        }),
      })
      const rtData = await rtRes.json()

      if (rtRes.ok && form.roomNumber) {
        await fetch('/api/manager/rooms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomTypeId: rtData.roomType.id,
            roomNumber: form.roomNumber,
            floor: Number(form.floor),
            status: 'available',
          }),
        })
      }

      setShowForm(false)
      setForm({ name: '', basePrice: '', capacity: '2', roomNumber: '', floor: '1' })
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading...</p>

  if (!canManage) {
    return (
      <Card
        title="Rooms Locked"
        description="Your hotel registration must be approved by an admin before you can add room listings."
      />
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">My Rooms</h1>
          <p className="text-on-surface-variant">Add and manage room types for your hotel.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Room Type'}
        </Button>
      </div>

      {showForm && (
        <Card title="New Room Type" className="mb-6">
          <form onSubmit={handleAddRoomType} className="space-y-4 max-w-xl">
            <Input label="Room Type Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Base Price ($)" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
              <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
            </div>
            <p className="text-sm text-on-surface-variant">Optional: add first room unit</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Room Number" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
              <Input label="Floor" type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            </div>
            <Button type="submit" loading={saving}>Create</Button>
          </form>
        </Card>
      )}

      {roomTypes.length === 0 ? (
        <Card title="No rooms yet" description="Add your first room type to start accepting bookings." />
      ) : (
        <div className="space-y-4">
          {roomTypes.map((rt) => (
            <Card key={rt.id}>
              <h3 className="text-lg font-semibold">{rt.name}</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                ${rt.basePrice}/night · Capacity: {rt.capacity}
              </p>
              {rt.rooms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {rt.rooms.map((room) => (
                    <span key={room.id} className="px-2 py-1 bg-surface-container-low rounded text-xs">
                      #{room.roomNumber} (Floor {room.floor})
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
