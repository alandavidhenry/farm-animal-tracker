require('dotenv').config()
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdmin() {
  const email = process.argv[2]
  const name = process.argv[3]
  const password = process.argv[4]

  if (!email || !password) {
    console.error('Usage: node create-admin-simple.js <email> <name> <password>')
    console.error('Example: node create-admin-simple.js admin@example.com "Admin User" mypassword')
    process.exit(1)
  }

  console.log('\n=== Creating Admin User ===\n')
  console.log('Email:', email)
  console.log('Name:', name || '(not set)')
  console.log('Password: ********\n')

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error(`❌ User with email ${email} already exists`)
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: 'ADMIN',
        active: true
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('\nDetails:')
    console.log('  ID:', admin.id)
    console.log('  Email:', admin.email)
    console.log('  Name:', admin.name || '(not set)')
    console.log('  Role:', admin.role)
    console.log('  Active:', admin.active)
    console.log('\n🎉 You can now sign in at /auth/signin\n')
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
