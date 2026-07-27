'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      const token = data.token ?? data.data?.token
      const role = data.user?.role ?? data.data?.role ?? (() => {
        try {
          return JSON.parse(atob(token.split('.')[1])).role
        } catch {
          return null
        }
      })()

      if (!res.ok && !data.success) {
        setError(data.error || 'Login failed')
        return
      }

      if (token) {
        localStorage.setItem('token', token)
        document.cookie = `token=${token}; path=/; max-age=604800`
      }

      if (role === 'admin') router.push('/admin')
      else if (role === 'hotel_manager') router.push('/manager')
      else if (role === 'staff') router.push('/staff/dashboard')
      else router.push(redirect)
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Sign In" description="Access your LuxeStay account">
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>
      <p className="text-sm text-on-surface-variant mt-4 text-center">
        Hotel owner?{' '}
        <Link href="/register-hotel" className="text-primary hover:underline">
          Register your hotel
        </Link>
      </p>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-primary hover:underline text-sm mb-6 inline-block">
          ← Back to LuxeStay
        </Link>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
