import type { Booking } from './booking'

export interface Guest {
  id: number
  userId?: number | null
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  preferences?: any
  createdAt: string
  updatedAt: string
  bookings?: Booking[]
}