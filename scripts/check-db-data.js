require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkData() {
  console.log('Checking existing data in database...\n')

  try {
    const animals = await prisma.animal.count()
    const weights = await prisma.weightRecord.count()
    const feeds = await prisma.feedRecord.count()
    const users = await prisma.user.count()

    console.log('Record counts:')
    console.log(`  Animals: ${animals}`)
    console.log(`  Weight Records: ${weights}`)
    console.log(`  Feed Records: ${feeds}`)
    console.log(`  Users: ${users}`)

    if (animals === 0 && weights === 0 && feeds === 0 && users === 0) {
      console.log('\n✅ Database has schema but no data')
      console.log('Safe to reset with: npx prisma db push --force-reset')
    } else {
      console.log('\n⚠️  Database contains data!')
      console.log('Using --force-reset will DELETE all this data')
      console.log('\nRecommended: Use --accept-data-loss instead')
    }

    if (users > 0) {
      console.log('\n📋 Existing users:')
      const userList = await prisma.user.findMany({
        select: { id: true, email: true, role: true }
      })
      userList.forEach((user) => {
        console.log(`  - ${user.email} (${user.role})`)
      })
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 'P2021') {
      console.log('\n💡 The table exists but Prisma client is out of sync.')
      console.log('Run: npm run db:generate')
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
