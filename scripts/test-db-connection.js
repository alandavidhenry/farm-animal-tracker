require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'NOT FOUND')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

async function testConnection() {
  console.log('Testing database connection...\n')

  try {
    // Try to connect
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query executed successfully:', result)

  } catch (error) {
    console.error('❌ Connection failed:')
    console.error('Error:', error.message)

    if (error.message.includes('not currently available')) {
      console.log('\n💡 Troubleshooting steps:')
      console.log('1. Check if the database is paused (Azure Portal > SQL Database)')
      console.log('2. Verify firewall rules allow your IP address')
      console.log('3. Confirm the database name is correct')
      console.log('4. Try restarting the database in Azure Portal')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
