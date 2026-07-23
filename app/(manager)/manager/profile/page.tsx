'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ManagerProfilePage() {
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    imageUrl: '',
  })

  useEffect(() => {
    fetch('/api/manager/hotel')
      .then((r) => r.json())
      .then((data) => {
        setCanManage(data.canManageListing)
        if (data.hotel) {
          setForm({
            name: data.hotel.name || '',
            description: data.hotel.description || '',
            address: data.hotel.address || '',
            city: data.hotel.city || '',
            country: data.hotel.country || '',
            phone: data.hotel.phone || '',
            email: data.hotel.email || '',
            imageUrl: data.hotel.imageUrl || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/manager/hotel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'active' }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Profile saved and hotel marked as active!')
      } else {
        setMessage(data.error || 'Failed to save profile')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading...</p>

  if (!canManage) {
    return (
      <Card
        title="Profile Locked"
        description="Your hotel registration must be approved by an admin before you can complete your listing profile."
      />
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-on-surface mb-2">Hotel Profile</h1>
      <p className="text-on-surface-variant mb-8">
        Complete your hotel listing details. Saving will publish your hotel as active.
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <Input label="Hotel Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="text-sm font-medium text-on-surface-variant">Description</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-outline-variant/40 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Input label="Cover Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          {message && <p className={`text-sm ${message.includes('saved') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
          <Button type="submit" loading={saving}>
            Save & Publish
          </Button>
        </form>
      </Card>
    </div>
  )
}
