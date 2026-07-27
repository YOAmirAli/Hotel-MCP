"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: 'guest',
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/login?registered=true')
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-container-low to-surface-container py-12 px-4">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl shadow-xl p-8 border border-outline-variant/20">
        <div className="text-center">
          <Link href="/" className="font-display-lg text-4xl text-primary block">LuxeStay</Link>
          <h2 className="mt-6 font-headline-sm text-2xl text-primary">Create Account</h2>
          <p className="mt-2 text-on-surface-variant">Join LuxeStay and book your stay</p>
        </div>

        {error && (
          <div className="mt-4 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm border border-error/20">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
              placeholder="+92 3XX XXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Confirm Password *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none bg-surface-container-low"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link href="/login" className="text-secondary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}