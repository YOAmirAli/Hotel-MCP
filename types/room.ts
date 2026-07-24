import { RoomType } from '@prisma/client'
import type { Booking } from './booking'

export interface Room {
  id: number
  roomTypeId: number
  roomNumber: string
  floor: number
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance'
  roomType: RoomType & { hotel?: any }
  bookings?: Booking[]
  housekeepings?: any[]
}