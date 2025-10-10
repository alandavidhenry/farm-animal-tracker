import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding local database...')

  // Create sample animals
  const sheep1 = await prisma.animal.create({
    data: {
      tagNumber: 'S001',
      type: 'SHEEP',
      birthDate: new Date('2023-03-15'),
      weights: {
        create: [
          {
            weight: 45.5,
            notes: 'Initial weight',
            recordedAt: new Date('2023-03-15')
          },
          {
            weight: 52.3,
            notes: 'Good weight gain',
            recordedAt: new Date('2023-06-15')
          },
          {
            weight: 58.7,
            notes: 'Healthy development',
            recordedAt: new Date('2023-09-15')
          }
        ]
      }
    }
  })

  const lamb1 = await prisma.animal.create({
    data: {
      tagNumber: 'L001',
      type: 'LAMB',
      motherId: sheep1.id,
      birthDate: new Date('2024-02-10'),
      weights: {
        create: [
          {
            weight: 4.2,
            notes: 'Birth weight',
            recordedAt: new Date('2024-02-10')
          },
          {
            weight: 12.5,
            notes: 'Growing well',
            recordedAt: new Date('2024-04-10')
          }
        ]
      }
    }
  })

  const goat1 = await prisma.animal.create({
    data: {
      tagNumber: 'G001',
      type: 'GOAT',
      birthDate: new Date('2023-05-20'),
      weights: {
        create: [
          {
            weight: 35.0,
            notes: 'Initial weight',
            recordedAt: new Date('2023-05-20')
          },
          {
            weight: 42.8,
            notes: 'Good condition',
            recordedAt: new Date('2023-08-20')
          }
        ]
      }
    }
  })

  console.log('Created sample animals:', {
    sheep1,
    lamb1,
    goat1
  })

  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
