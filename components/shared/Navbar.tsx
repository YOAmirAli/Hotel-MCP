"use client"

import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed w-full top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <Link href="/" className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
          LuxeStay
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link href="/rooms" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200">
            Rooms
          </Link>
          <Link href="/my-bookings" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200">
            My Bookings
          </Link>
          <Link href="/register-hotel" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200">
            List Your Hotel
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/booking"
            className="bg-primary text-on-primary px-8 py-3 rounded-DEFAULT font-label-md text-label-md uppercase tracking-widest hover:bg-primary-container transition-all active:scale-95"
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
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/30 p-4 flex flex-col gap-4">
          <Link href="/rooms" className="font-body-md text-on-surface-variant">Rooms</Link>
          <Link href="/my-bookings" className="font-body-md text-on-surface-variant">My Bookings</Link>
          <Link href="/register-hotel" className="font-body-md text-secondary">List Your Hotel</Link>
        </div>
      )}
    </nav>
  )
}