import type { Guest } from './guest'
import type { Room } from './room'

export interface Payment {
  id: number
  bookingId: number
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  paymentIntentId?: string | null
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: number
  guestId: number
  roomId: number
  checkIn: string
  checkOut: string
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  totalAmount: number
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  createdAt: string
  updatedAt: string
  guest?: Guest
  room?: Room
  payments?: Payment[]
}