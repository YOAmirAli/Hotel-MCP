import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@luxestay.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) {
    console.log('Admin user already exists:', adminEmail)
    return
  }

  const hashed = await bcrypt.hash(adminPassword, 12)
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashed,
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'admin',
    },
  })

  console.log('Admin user created:')
  console.log('  Email:', adminEmail)
  console.log('  Password:', adminPassword)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
