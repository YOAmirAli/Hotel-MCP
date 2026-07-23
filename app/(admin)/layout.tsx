"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Registrations', href: '/admin/registrations', icon: 'assignment' },
  { label: 'Hotels', href: '/admin/hotels', icon: 'hotel' },
  { label: 'Users', href: '/admin/users', icon: 'people' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Simple auth check – redirect if not admin
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin') {
        router.push('/')
      }
    } catch {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 bg-primary-container shadow-xl flex flex-col py-6 z-40">
        <div className="px-6 mb-8">
          <h1 className="font-headline-sm text-headline-sm text-on-primary">Admin Panel</h1>
          <p className="font-label-md text-label-md text-on-primary-container/70">Super Admin</p>
        </div>
        <nav className="flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 transition-all ${
                  isActive
                    ? 'border-l-4 border-secondary-fixed bg-surface-container-highest/10 text-on-primary'
                    : 'text-on-primary-container/70 hover:bg-surface-container-highest/5 hover:text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 pt-4 px-6">
          <button
            onClick={() => {
              localStorage.removeItem('token')
              router.push('/login')
            }}
            className="flex items-center gap-3 text-on-primary-container/70 hover:text-on-primary transition-all w-full py-2"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 min-h-screen p-8">{children}</main>
    </div>
  )
}