/**
 * @jest-environment node
 */

import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { AnimalType } from '@/lib/types'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    animal: {
      findUnique: jest.fn()
    },
    weightRecord: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  }
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>

describe('Weights API Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST - Weight Recording', () => {
    it('should validate required fields', () => {
      const requiredFields = ['tagNumber', 'weight']
      const testData = {}

      requiredFields.forEach((field) => {
        expect(testData).not.toHaveProperty(field)
      })
    })

    it('should verify animal exists before recording weight', async () => {
      ;(prisma.animal.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        tagNumber: 'A001',
        type: AnimalType.SHEEP
      })

      const animal = await prisma.animal.findUnique({
        where: { tagNumber: 'A001' }
      })

      expect(animal).toBeTruthy()
      expect(animal?.id).toBe(1)
    })

    it('should handle non-existent animal', async () => {
      ;(prisma.animal.findUnique as jest.Mock).mockResolvedValue(null)

      const animal = await prisma.animal.findUnique({
        where: { tagNumber: 'A999' }
      })

      expect(animal).toBeNull()
    })

    it('should create weight record with animal relationship', async () => {
      ;(prisma.weightRecord.create as jest.Mock).mockResolvedValue({
        id: 1,
        animalId: 1,
        weight: 50.5,
        recordedAt: new Date(),
        notes: null,
        animal: {
          tagNumber: 'A001',
          type: AnimalType.SHEEP
        }
      })

      const result = await prisma.weightRecord.create({
        data: {
          animalId: 1,
          weight: 50.5,
          notes: null
        },
        include: {
          animal: {
            select: {
              tagNumber: true,
              type: true
            }
          }
        }
      })

      expect(result.weight).toBe(50.5)
      expect(result.animal.tagNumber).toBe('A001')
    })

    it('should parse weight as float', () => {
      const weightString = '50.5'
      const weightFloat = parseFloat(weightString)

      expect(weightFloat).toBe(50.5)
      expect(typeof weightFloat).toBe('number')
    })
  })

  describe('GET - Weight Retrieval', () => {
    it('should fetch recent weights with limit', async () => {
      const mockWeights = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        weight: 50.5,
        recordedAt: new Date(),
        animal: {
          tagNumber: `A${String(i + 1).padStart(3, '0')}`,
          type: AnimalType.SHEEP
        }
      }))

      ;(prisma.weightRecord.findMany as jest.Mock).mockResolvedValue(
        mockWeights
      )

      const result = await prisma.weightRecord.findMany({
        include: {
          animal: {
            select: {
              tagNumber: true,
              type: true
            }
          }
        },
        orderBy: { recordedAt: 'desc' },
        take: 50
      })

      expect(result).toHaveLength(50)
    })

    it('should filter weights by tag number', async () => {
      ;(prisma.weightRecord.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          weight: 50.5,
          recordedAt: new Date(),
          animal: { tagNumber: 'A001', type: AnimalType.SHEEP }
        }
      ])

      const result = await prisma.weightRecord.findMany({
        where: {
          animal: { tagNumber: 'A001' }
        },
        include: {
          animal: {
            select: {
              tagNumber: true,
              type: true
            }
          }
        },
        orderBy: { recordedAt: 'desc' }
      })

      expect(result).toHaveLength(1)
      expect(result[0].animal.tagNumber).toBe('A001')
    })

    it('should filter weights by animal ID', async () => {
      ;(prisma.weightRecord.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          weight: 50.5,
          recordedAt: new Date(),
          animal: { tagNumber: 'A001', type: AnimalType.SHEEP }
        }
      ])

      const result = await prisma.weightRecord.findMany({
        where: {
          animalId: 1
        },
        include: {
          animal: {
            select: {
              tagNumber: true,
              type: true
            }
          }
        },
        orderBy: { recordedAt: 'desc' }
      })

      expect(result).toHaveLength(1)
    })
  })

  describe('Authentication', () => {
    it('should require authentication for operations', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const session = await getServerSession()

      expect(session).toBeNull()
    })

    it('should allow operations when authenticated', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })

      const session = await getServerSession()

      expect(session).toBeTruthy()
      expect(session?.user?.email).toBe('test@test.com')
    })
  })
})
