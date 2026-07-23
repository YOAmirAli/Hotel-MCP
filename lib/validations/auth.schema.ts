import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['guest', 'staff', 'admin', 'hotel_manager']).optional(),
})

export const hotelRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  hotelName: z.string().min(2).max(200),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  description: z.string().max(2000).optional(),
})

export const reviewRegistrationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminNotes: z.string().max(1000).optional(),
})

export const hotelProfileSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional(),
  address: z.string().min(5).max(500).optional(),
  city: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['pending_profile', 'active', 'suspended']).optional(),
})

export const roomTypeSchema = z.object({
  hotelId: z.number().int().positive().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  basePrice: z.number().positive(),
  capacity: z.number().int().min(1).max(20).default(2),
  amenities: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export const roomSchema = z.object({
  roomTypeId: z.number().int().positive(),
  roomNumber: z.string().min(1).max(10),
  floor: z.number().int().min(0),
  status: z.enum(['available', 'occupied', 'cleaning', 'maintenance']).default('available'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type HotelRegistrationInput = z.infer<typeof hotelRegistrationSchema>
export type RoomTypeInput = z.infer<typeof roomTypeSchema>
export type RoomInput = z.infer<typeof roomSchema>
