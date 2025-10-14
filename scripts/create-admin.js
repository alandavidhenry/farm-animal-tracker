const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function createAdmin() {
  console.log('\n=== Create Admin User ===\n')

  const email = await question('Enter admin email: ')
  const name = await question('Enter admin name (optional): ')
  const password = await question('Enter admin password: ')

  if (!email || !password) {
    console.error('Error: Email and password are required')
    rl.close()
    return
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`)
      rl.close()
      return
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

    console.log('\n✅ Admin user created successfully!')
    console.log('Email:', admin.email)
    console.log('Name:', admin.name || '(not set)')
    console.log('Role:', admin.role)
    console.log('\nYou can now sign in with these credentials.\n')
  } catch (error) {
    console.error('Error creating admin user:', error.message)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createAdmin()
