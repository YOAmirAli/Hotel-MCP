"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem('token', data.data.token)
        document.cookie = `token=${data.data.token}; path=/; max-age=604800`
        
        const payload = JSON.parse(atob(data.data.token.split('.')[1]))
        if (payload.role === 'admin') {
          router.push('/admin')
        } else if (payload.role === 'hotel_manager') {
          router.push('/manager')
        } else if (payload.role === 'staff') {
          router.push('/staff/dashboard')
        } else {
          router.push('/')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-display-lg-mobile text-primary">LuxeStay</h1>
          <p className="text-on-surface-variant mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-label-md text-on-surface-variant">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              placeholder="admin@luxestay.com"
              required
            />
          </div>

          <div>
            <label className="font-label-md text-on-surface-variant">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-on-surface-variant text-sm">
            Don't have an account?{' '}
            <Link href="/register-hotel" className="text-secondary hover:underline">
              Register your hotel
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}