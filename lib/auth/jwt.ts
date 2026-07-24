import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d'

export type UserRole = 'guest' | 'hotel_manager' | 'staff' | 'admin'

export interface JwtPayload {
  userId: number
  email: string
  role: UserRole
  hotelId?: number
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}