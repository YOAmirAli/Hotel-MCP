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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-container-low to-surface-container py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface-container-lowest rounded-2xl shadow-xl p-8 border border-outline-variant/20">
        <div>
          <Link href="/" className="block text-center">
            <h1 className="font-display-lg text-4xl text-primary">LuxeStay</h1>
          </Link>
          <h2 className="mt-6 text-center font-headline-sm text-2xl text-on-surface">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-on-surface-variant">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm border border-error/20">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                placeholder="admin@luxestay.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all bg-surface-container-low"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link href="/register-hotel" className="text-secondary hover:underline font-medium">
              Register your hotel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
<div className="text-center text-sm text-on-surface-variant">
  Don't have an account?{' '}
  <Link href="/signup" className="text-secondary hover:underline font-medium">
    Create one
  </Link>
</div>