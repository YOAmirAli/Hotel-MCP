"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"

// Initialize Stripe with publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Wrapper component to use useSearchParams
function BookingFormContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  // Get query params from room selection
  const roomId = parseInt(searchParams.get("roomId") || "0")
  const checkIn = searchParams.get("checkIn") || ""
  const checkOut = searchParams.get("checkOut") || ""
  const guests = parseInt(searchParams.get("guests") || "2")
  const pricePerNight = parseFloat(searchParams.get("price") || "0")
  const total = parseFloat(searchParams.get("total") || "0")
  const nights = parseInt(searchParams.get("nights") || "1")
  const roomName = searchParams.get("roomName") || "Selected Room"

  // State
  const [step, setStep] = useState(1)
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [selectedServices, setSelectedServices] = useState({
    breakfast: false,
    airport: false,
    lateCheckout: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [bookingId, setBookingId] = useState<number | null>(null)

  // Service prices
  const servicePrices = {
    breakfast: 45 * nights,
    airport: 120,
    lateCheckout: 75,
  }

  const calculateTotal = () => {
    let totalServices = 0
    if (selectedServices.breakfast) totalServices += servicePrices.breakfast
    if (selectedServices.airport) totalServices += servicePrices.airport
    if (selectedServices.lateCheckout) totalServices += servicePrices.lateCheckout
    return total + totalServices
  }

  const handleNext = () => {
    // Step 1 validation
    if (step === 1) {
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
        setError("Please fill in all required fields.")
        return
      }
      setError("")
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  // Step 3: Submit booking
  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      // 1. Create booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestEmail: guestInfo.email,
          guestFirstName: guestInfo.firstName,
          guestLastName: guestInfo.lastName,
          guestPhone: guestInfo.phone,
          roomId,
          checkIn,
          checkOut,
          guests,
        }),
      })
      const bookingData = await bookingRes.json()
      if (!bookingData.success) {
        throw new Error(bookingData.error || "Booking creation failed")
      }

      setClientSecret(bookingData.data.clientSecret)
      setBookingId(bookingData.data.bookingId)

      // 2. Confirm payment with Stripe
      if (!stripe || !elements) {
        throw new Error("Stripe not initialized")
      }
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        bookingData.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${guestInfo.firstName} ${guestInfo.lastName}`,
              email: guestInfo.email,
            },
          },
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed")
      }

      // Payment successful
      router.push(`/booking/success?bookingId=${bookingData.data.bookingId}`)

    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
      <header className="mb-12 text-center">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
          Complete Your Reservation
        </h1>
        <p className="text-on-surface-variant max-w-lg mx-auto">
          Experience unmatched luxury. Please provide your details to confirm your stay at LuxeStay.
        </p>
      </header>

      {/* Stepper */}
      <div className="relative mb-16 px-4">
        <div className="flex justify-between items-center max-w-2xl mx-auto relative z-10">
          {["Guest Info", "Services", "Payment"].map((label, index) => {
            const stepNum = index + 1
            const isActive = step === stepNum
            const isCompleted = step > stepNum
            return (
              <div key={stepNum} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive || isCompleted
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-high text-outline border-outline-variant"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    <span className="font-label-md">{stepNum}</span>
                  )}
                </div>
                <span className={`font-label-sm ${isActive ? "text-on-surface" : "text-outline"}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-full max-w-[400px] h-0.5 bg-outline-variant/30 z-0" />
        <div
          className="absolute top-5 left-[calc(50%-200px)] h-0.5 bg-primary transition-all duration-500 z-0"
          style={{ width: `${((step - 1) / 2) * 400}px` }}
        />
      </div>

      {/* Form */}
      <div className="bg-surface-container-lowest border border-[#EAE2D5] rounded-xl shadow-[0_20px_50px_rgba(1,2,2,0.05)] overflow-hidden">
        <div className="p-8 md:p-12">
          {error && (
            <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Guest Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-8">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">First Name *</label>
                  <input
                    type="text"
                    value={guestInfo.firstName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                    className="w-full bg-transparent border border-outline-variant rounded-lg p-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">Last Name *</label>
                  <input
                    type="text"
                    value={guestInfo.lastName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                    className="w-full bg-transparent border border-outline-variant rounded-lg p-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="font-label-md text-on-surface-variant">Email Address *</label>
                  <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className="w-full bg-transparent border border-outline-variant rounded-lg p-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="font-label-md text-on-surface-variant">Phone Number</label>
                  <input
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="w-full bg-transparent border border-outline-variant rounded-lg p-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary mb-8">Enhance Your Stay</h2>
              <div className="space-y-4">
                <ServiceCheckbox
                  label="Signature Breakfast"
                  desc={`Daily gourmet breakfast in our rooftop lounge.`}
                  price={`$${servicePrices.breakfast} total`}
                  checked={selectedServices.breakfast}
                  onChange={(checked) => setSelectedServices({ ...selectedServices, breakfast: checked })}
                />
                <ServiceCheckbox
                  label="Airport Transfer"
                  desc="Private chauffeur service to/from international airport."
                  price={`$${servicePrices.airport}`}
                  checked={selectedServices.airport}
                  onChange={(checked) => setSelectedServices({ ...selectedServices, airport: checked })}
                />
                <ServiceCheckbox
                  label="Late Check-out"
                  desc="Extend your stay until 4:00 PM on departure day."
                  price={`$${servicePrices.lateCheckout}`}
                  checked={selectedServices.lateCheckout}
                  onChange={(checked) => setSelectedServices({ ...selectedServices, lateCheckout: checked })}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Payment */}
          {step === 3 && (
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary mb-8">Review & Confirm</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-surface-container-low p-6 rounded-lg border border-[#EAE2D5]">
                    <h3 className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Reservation Summary</h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-on-surface-variant">{roomName} ({nights} Nights)</span>
                      <span className="font-bold text-primary">${total.toFixed(2)}</span>
                    </div>
                    {selectedServices.breakfast && (
                      <div className="flex justify-between mb-2">
                        <span className="text-on-surface-variant">Signature Breakfast ({nights} Days)</span>
                        <span className="font-bold text-primary">${servicePrices.breakfast.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedServices.airport && (
                      <div className="flex justify-between mb-2">
                        <span className="text-on-surface-variant">Airport Transfer</span>
                        <span className="font-bold text-primary">${servicePrices.airport.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedServices.lateCheckout && (
                      <div className="flex justify-between mb-2">
                        <span className="text-on-surface-variant">Late Check-out</span>
                        <span className="font-bold text-primary">${servicePrices.lateCheckout.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-4 border-t border-outline-variant/30 mt-4">
                      <span className="font-title-lg text-title-lg text-primary">Total Amount</span>
                      <span className="font-title-lg text-title-lg text-secondary">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-label-sm text-on-surface-variant uppercase tracking-widest">Payment Method</h3>
                    <div className="p-4 border border-outline-variant rounded-lg">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#191c1e",
                              "::placeholder": { color: "#747879" },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="rounded-lg overflow-hidden border border-[#EAE2D5] h-full flex flex-col bg-surface-container-low">
                    <div className="bg-cover bg-center h-48 w-full" />
                    <div className="p-4 bg-white flex-grow">
                      <p className="font-label-sm text-secondary-container bg-secondary px-2 py-1 rounded w-fit mb-2">SELECTED ROOM</p>
                      <h4 className="font-title-lg text-title-lg text-primary">{roomName}</h4>
                      <p className="text-body-md text-on-surface-variant mt-2">Floor {roomId} • {nights} Nights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex justify-between items-center border-t border-outline-variant/30 pt-8">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md transition-all ${step === 1 ? "invisible" : ""}`}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back</span>
            </button>
            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={loading}
              className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : step === 3 ? (
                <>
                  <span>Confirm Booking</span>
                  <span className="material-symbols-outlined">verified</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Service checkbox component
function ServiceCheckbox({
  label,
  desc,
  price,
  checked,
  onChange,
}: {
  label: string
  desc: string
  price: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between p-6 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 flex items-center justify-center bg-secondary-fixed rounded-full text-on-secondary-fixed">
          <span className="material-symbols-outlined">restaurant</span>
        </div>
        <div>
          <h3 className="font-title-lg text-title-lg text-primary">{label}</h3>
          <p className="text-on-surface-variant text-body-md">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-label-md text-secondary font-bold">{price}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-6 h-6 rounded border-outline-variant text-secondary focus:ring-secondary"
        />
      </div>
    </label>
  )
}

// Main component with Suspense
export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading booking form...</div>}>
      <Elements stripe={stripePromise}>
        <BookingFormContent />
      </Elements>
    </Suspense>
  )
}