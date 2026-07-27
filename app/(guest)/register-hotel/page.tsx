"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterHotelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    hotelName: '',
    managerFirstName: '',
    managerLastName: '',
    managerEmail: '',
    managerPhone: '',
    hotelAddress: '',
    hotelCity: '',
    hotelCountry: '',
    hotelPhone: '',
    hotelEmail: '',
    description: '',
    password: '',
    confirmPassword: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register-hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName: formData.hotelName,
          managerFirstName: formData.managerFirstName,
          managerLastName: formData.managerLastName,
          managerEmail: formData.managerEmail,
          managerPhone: formData.managerPhone,
          hotelAddress: formData.hotelAddress,
          hotelCity: formData.hotelCity,
          hotelCountry: formData.hotelCountry,
          hotelPhone: formData.hotelPhone,
          hotelEmail: formData.hotelEmail,
          description: formData.description,
          password: formData.password,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-container-low to-surface-container px-4">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl shadow-xl p-8 text-center border border-outline-variant/20">
          <div className="w-20 h-20 bg-secondary-fixed text-secondary flex items-center justify-center rounded-full mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="font-headline-sm text-2xl text-primary mb-2">Registration Submitted!</h2>
          <p className="text-on-surface-variant">Your hotel registration is pending admin approval.</p>
          <p className="text-on-surface-variant text-sm mt-4">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-surface-container-low to-surface-container">
      <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-2xl shadow-xl p-8 border border-outline-variant/20">
        <div className="text-center mb-8">
          <Link href="/" className="font-display-lg text-4xl text-primary block mb-2">LuxeStay</Link>
          <h1 className="font-headline-sm text-2xl text-primary">Register Your Hotel</h1>
          <p className="text-on-surface-variant">Submit your hotel for approval by the admin</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm border border-error/20 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hotel Name & Description */}
          <div className="space-y-4">
            <h3 className="font-title-lg text-primary border-b border-outline-variant/20 pb-2">Hotel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Hotel Name *</label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Manager Details */}
          <div className="space-y-4">
            <h3 className="font-title-lg text-primary border-b border-outline-variant/20 pb-2">Manager Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.managerFirstName}
                  onChange={(e) => setFormData({ ...formData, managerFirstName: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.managerLastName}
                  onChange={(e) => setFormData({ ...formData, managerLastName: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.managerPhone}
                  onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                />
              </div>
            </div>
          </div>

          {/* Hotel Address */}
          <div className="space-y-4">
            <h3 className="font-title-lg text-primary border-b border-outline-variant/20 pb-2">Hotel Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Address</label>
                <input
                  type="text"
                  value={formData.hotelAddress}
                  onChange={(e) => setFormData({ ...formData, hotelAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">City</label>
                <input
                  type="text"
                  value={formData.hotelCity}
                  onChange={(e) => setFormData({ ...formData, hotelCity: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Country</label>
                <input
                  type="text"
                  value={formData.hotelCountry}
                  onChange={(e) => setFormData({ ...formData, hotelCountry: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Hotel Phone</label>
                <input
                  type="tel"
                  value={formData.hotelPhone}
                  onChange={(e) => setFormData({ ...formData, hotelPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Hotel Email</label>
                <input
                  type="email"
                  value={formData.hotelEmail}
                  onChange={(e) => setFormData({ ...formData, hotelEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                />
              </div>
            </div>
          </div>

          {/* Account Setup */}
          <div className="space-y-4">
            <h3 className="font-title-lg text-primary border-b border-outline-variant/20 pb-2">Account Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  )
}