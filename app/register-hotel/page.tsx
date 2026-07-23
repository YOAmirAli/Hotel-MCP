"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    } catch (err) {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-secondary-fixed text-secondary flex items-center justify-center rounded-full mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <h2 className="font-headline-sm text-primary mb-2">Registration Submitted!</h2>
          <p className="text-on-surface-variant">Your hotel registration is pending admin approval. You'll receive an email once approved.</p>
          <p className="text-on-surface-variant text-sm mt-4">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-display-lg-mobile text-primary">Register Your Hotel</h1>
          <p className="text-on-surface-variant">Submit your hotel for approval by the admin</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-on-surface-variant">Hotel Name *</label>
              <input
                type="text"
                value={formData.hotelName}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
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
                rows={3}
              />
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-6">
            <h3 className="font-title-lg text-primary mb-4">Manager Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-on-surface-variant">First Name *</label>
                <input
                  type="text"
                  value={formData.managerFirstName}
                  onChange={(e) => setFormData({ ...formData, managerFirstName: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">Last Name *</label>
                <input
                  type="text"
                  value={formData.managerLastName}
                  onChange={(e) => setFormData({ ...formData, managerLastName: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">Email *</label>
                <input
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">Phone</label>
                <input
                  type="tel"
                  value={formData.managerPhone}
                  onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-6">
            <h3 className="font-title-lg text-primary mb-4">Hotel Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-on-surface-variant">Address</label>
                <input
                  type="text"
                  value={formData.hotelAddress}
                  onChange={(e) => setFormData({ ...formData, hotelAddress: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">City</label>
                <input
                  type="text"
                  value={formData.hotelCity}
                  onChange={(e) => setFormData({ ...formData, hotelCity: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">Country</label>
                <input
                  type="text"
                  value={formData.hotelCountry}
                  onChange={(e) => setFormData({ ...formData, hotelCountry: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">Hotel Phone</label>
                <input
                  type="tel"
                  value={formData.hotelPhone}
                  onChange={(e) => setFormData({ ...formData, hotelPhone: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">Hotel Email</label>
                <input
                  type="email"
                  value={formData.hotelEmail}
                  onChange={(e) => setFormData({ ...formData, hotelEmail: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-6">
            <h3 className="font-title-lg text-primary mb-4">Account Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-on-surface-variant">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant">Confirm Password *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/30">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}