import type { UserRole } from './jwt'

export type { UserRole }

export const rolePermissions = {
  guest: ['read:own-bookings', 'create:booking', 'update:own-profile'],
  staff: ['read:all-bookings', 'update:booking', 'read:rooms', 'update:rooms', 'read:guests'],
  hotel_manager: [
    'read:own-hotel',
    'update:own-hotel',
    'read:own-rooms',
    'update:own-rooms',
    'create:registration-request',
  ],
  admin: ['*'],
} as const

export function hasPermission(userRole: UserRole, requiredPermission: string): boolean {
  if (userRole === 'admin') return true
  const perms = rolePermissions[userRole] as readonly string[]
  return perms.includes(requiredPermission) || perms.includes('*')
}

export function canEditRooms(role: UserRole): boolean {
  return role === 'admin' || role === 'staff' || role === 'hotel_manager'
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin'
}

export function isHotelManager(role: UserRole): boolean {
  return role === 'hotel_manager'
}
