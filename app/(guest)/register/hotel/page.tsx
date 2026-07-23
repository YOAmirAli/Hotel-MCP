'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function HotelRegistrationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    hotelName: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    description: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register/hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      router.push('/manager')
    } catch {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-primary hover:underline text-sm mb-6 inline-block">
          ← Back to LuxeStay
        </Link>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Register Your Hotel</h1>
        <p className="text-on-surface-variant mb-8">
          Submit your initial registration request. An admin will review and approve it before you can complete your hotel profile and add rooms.
        </p>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Your Account</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Hotel Details</h3>
              <Input label="Hotel Name" value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} required />
              <div className="mt-4">
                <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
              </div>
              <div className="mt-4">
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-on-surface-variant">Description</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border border-outline-variant/40 rounded-lg bg-white"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Submit for Admin Approval
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
