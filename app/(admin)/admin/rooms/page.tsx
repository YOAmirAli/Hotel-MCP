'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface RoomType {
  id: number
  name: string
  description: string | null
  basePrice: number
  capacity: number
  hotel: { id: number; name: string }
  rooms: { id: number; roomNumber: string; floor: number; status: string }[]
}

export default function AdminRoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: '', basePrice: '', capacity: '' })
  const [saving, setSaving] = useState(false)

  async function loadRooms() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/rooms')
      const data = await res.json()
      setRoomTypes(data.roomTypes || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  function startEdit(rt: RoomType) {
    setEditingId(rt.id)
    setEditForm({
      name: rt.name,
      basePrice: String(rt.basePrice),
      capacity: String(rt.capacity),
    })
  }

  async function saveEdit(id: number) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/rooms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          basePrice: Number(editForm.basePrice),
          capacity: Number(editForm.capacity),
        }),
      })
      if (res.ok) {
        setEditingId(null)
        await loadRooms()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-on-surface mb-2">Manage Rooms</h1>
      <p className="text-on-surface-variant mb-8">
        Admin can edit room types and listings across all hotels on the platform.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : roomTypes.length === 0 ? (
        <Card title="No rooms yet" description="Room types will appear here once hotel managers add listings." />
      ) : (
        <div className="space-y-4">
          {roomTypes.map((rt) => (
            <Card key={rt.id}>
              {editingId === rt.id ? (
                <div className="space-y-4">
                  <Input
                    label="Room Type Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Base Price"
                      type="number"
                      value={editForm.basePrice}
                      onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                    />
                    <Input
                      label="Capacity"
                      type="number"
                      value={editForm.capacity}
                      onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button loading={saving} onClick={() => saveEdit(rt.id)}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wide">{rt.hotel.name}</p>
                    <h3 className="text-lg font-semibold mt-1">{rt.name}</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                      ${rt.basePrice}/night · Capacity: {rt.capacity} · {rt.rooms.length} room(s)
                    </p>
                    {rt.rooms.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {rt.rooms.map((room) => (
                          <span
                            key={room.id}
                            className="px-2 py-1 bg-surface-container-low rounded text-xs"
                          >
                            #{room.roomNumber} (Floor {room.floor}) — {room.status}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => startEdit(rt)}>
                    Edit
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
