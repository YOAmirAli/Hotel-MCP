"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setIsLoggedIn(true)
        setUserRole(payload.role)
      } catch {
        setIsLoggedIn(false)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    document.cookie = 'token=; path=/; max-age=0'
    setIsLoggedIn(false)
    router.push('/login')
  }

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-7xl mx-auto">
        <Link href="/" className="font-display-lg text-2xl md:text-4xl text-primary">
          LuxeStay
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/rooms" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            Rooms
          </Link>
          {isLoggedIn && (
            <Link href="/my-bookings" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              My Bookings
            </Link>
          )}
          {!isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              Logout
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 md:hidden">
          <button
            className="material-symbols-outlined text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "close" : "menu"}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-outline-variant/30 p-4 flex flex-col gap-4">
          <Link href="/rooms" className="text-on-surface-variant">Rooms</Link>
          {isLoggedIn && (
            <Link href="/my-bookings" className="text-on-surface-variant">My Bookings</Link>
          )}
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="text-on-surface-variant">Login</Link>
              <Link href="/signup" className="text-secondary font-medium">Sign Up</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="text-on-surface-variant text-left">Logout</button>
          )}
        </div>
      )}
    </nav>
  )
}