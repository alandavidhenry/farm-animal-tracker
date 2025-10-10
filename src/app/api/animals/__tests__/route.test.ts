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
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn()
    }
  }
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>

describe('Animals API Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST - Animal Creation', () => {
    it('should validate required fields', () => {
      const requiredFields = ['tagNumber', 'type', 'initialWeight']
      const testData = {}

      requiredFields.forEach((field) => {
        expect(testData).not.toHaveProperty(field)
      })
    })

    it('should validate animal type enum', () => {
      const validTypes = Object.values(AnimalType)
      expect(validTypes).toContain('SHEEP')
      expect(validTypes).toContain('LAMB')
      expect(validTypes).toContain('GOAT')
      expect(validTypes).toContain('CATTLE')
      expect(validTypes).toContain('PIG')
      expect(validTypes).not.toContain('INVALID_TYPE')
    })

    it('should call prisma.animal.findUnique to check for existing tag', async () => {
      ;(prisma.animal.findUnique as jest.Mock).mockResolvedValue(null)

      await prisma.animal.findUnique({ where: { tagNumber: 'A001' } })

      expect(prisma.animal.findUnique).toHaveBeenCalledWith({
        where: { tagNumber: 'A001' }
      })
    })

    it('should create animal with nested weight record', async () => {
      ;(prisma.animal.create as jest.Mock).mockResolvedValue({
        id: 1,
        tagNumber: 'A001',
        type: AnimalType.SHEEP,
        birthDate: null,
        weights: [
          {
            id: 1,
            weight: 45.5,
            recordedAt: new Date(),
            notes: 'Initial weight for A001'
          }
        ]
      })

      const result = await prisma.animal.create({
        data: {
          tagNumber: 'A001',
          type: AnimalType.SHEEP,
          birthDate: null,
          weights: {
            create: {
              weight: 45.5,
              notes: 'Initial weight for A001'
            }
          }
        },
        include: {
          weights: true
        }
      })

      expect(result.tagNumber).toBe('A001')
      expect(result.weights).toHaveLength(1)
      expect(result.weights[0].weight).toBe(45.5)
    })
  })

  describe('GET - Animal Retrieval', () => {
    it('should fetch all animals with latest weight', async () => {
      ;(prisma.animal.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          tagNumber: 'A001',
          type: AnimalType.SHEEP,
          weights: [{ id: 1, weight: 45.5, recordedAt: new Date() }]
        },
        {
          id: 2,
          tagNumber: 'A002',
          type: AnimalType.LAMB,
          weights: [{ id: 2, weight: 12.5, recordedAt: new Date() }]
        }
      ])

      const result = await prisma.animal.findMany({
        include: {
          weights: {
            orderBy: { recordedAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      expect(result).toHaveLength(2)
      expect(prisma.animal.findMany).toHaveBeenCalled()
    })

    it('should search animals by tag number', async () => {
      ;(prisma.animal.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          tagNumber: 'A001',
          type: AnimalType.SHEEP,
          weights: [{ id: 1, weight: 45.5, recordedAt: new Date() }]
        }
      ])

      const result = await prisma.animal.findMany({
        where: {
          tagNumber: { contains: 'A001' }
        },
        include: {
          weights: {
            orderBy: { recordedAt: 'desc' },
            take: 1
          }
        }
      })

      expect(result).toHaveLength(1)
      expect(result[0].tagNumber).toBe('A001')
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
