"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  return (
    <div className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop text-center py-20">
      <div className="w-20 h-20 bg-secondary-fixed text-secondary flex items-center justify-center rounded-full mx-auto mb-6">
        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>
      <h2 className="font-display-lg text-display-lg-mobile text-primary mb-4">Booking Confirmed!</h2>
      <p className="text-on-surface-variant mb-8">
        Your sanctuary awaits. A confirmation email has been sent to your inbox with all reservation details.
        {bookingId && <br /><span className="text-sm">Booking Reference: #{bookingId}</span>}
      </p>
      <Link
        href="/"
        className="inline-block bg-primary text-on-primary px-8 py-4 rounded-lg font-label-md hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}