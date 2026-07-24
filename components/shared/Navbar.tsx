"use client"

import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-7xl mx-auto">
        <Link href="/" className="font-display-lg text-2xl md:text-4xl text-primary">
          LuxeStay
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link href="/rooms" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            Rooms
          </Link>
          <Link href="/my-bookings" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            My Bookings
          </Link>
          <Link href="/register-hotel" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
            List Your Hotel
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/booking"
            className="bg-primary text-white px-8 py-3 rounded-lg text-sm font-semibold uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95"
          >
            Book Now
          </Link>
          <button
            className="md:hidden material-symbols-outlined text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "close" : "menu"}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-outline-variant/30 p-4 flex flex-col gap-4">
          <Link href="/rooms" className="text-on-surface-variant">Rooms</Link>
          <Link href="/my-bookings" className="text-on-surface-variant">My Bookings</Link>
          <Link href="/register-hotel" className="text-secondary">List Your Hotel</Link>
        </div>
      )}
    </nav>
  )
}