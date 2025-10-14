require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTables() {
  console.log('Checking existing database tables...\n')

  try {
    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      AND TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `

    if (tables.length === 0) {
      console.log('✅ No tables found - database is empty')
      console.log('You can safely run: npx prisma db push')
    } else {
      console.log(`Found ${tables.length} table(s):\n`)
      tables.forEach((table) => {
        console.log(`  - ${table.TABLE_NAME}`)
      })

      console.log('\n💡 Options:')
      console.log('1. Drop existing tables and recreate (DESTRUCTIVE):')
      console.log('   npx prisma db push --force-reset')
      console.log('\n2. Accept data loss and push schema:')
      console.log('   npx prisma db push --accept-data-loss')
      console.log('\n3. Manually drop conflicting tables from Azure Portal/SSMS')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()
