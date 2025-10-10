/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

import { GET, POST } from '../route'

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

describe('Weights API Route Handlers - Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/weights', () => {
    it('should return 401 for unauthenticated request', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/weights', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001',
          weight: 50.5
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for missing required fields', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })

      const request = new NextRequest('http://localhost:3000/api/weights', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001'
          // Missing weight
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    it('should return 404 when animal not found', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.animal.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/weights', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A999',
          weight: 50.5
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Animal not found')
    })

    it('should successfully create weight record', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.animal.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        tagNumber: 'A001',
        type: AnimalType.SHEEP
      })
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

      const request = new NextRequest('http://localhost:3000/api/weights', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001',
          weight: 50.5
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Weight recorded successfully')
      expect(data.weightRecord.weight).toBe(50.5)
      expect(data.weightRecord.animal.tagNumber).toBe('A001')
    })

    it('should create weight record with notes', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.animal.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        tagNumber: 'A001',
        type: AnimalType.SHEEP
      })
      ;(prisma.weightRecord.create as jest.Mock).mockResolvedValue({
        id: 1,
        animalId: 1,
        weight: 50.5,
        recordedAt: new Date(),
        notes: 'After shearing',
        animal: {
          tagNumber: 'A001',
          type: AnimalType.SHEEP
        }
      })

      const request = new NextRequest('http://localhost:3000/api/weights', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001',
          weight: 50.5,
          notes: 'After shearing'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.weightRecord.notes).toBe('After shearing')
    })

    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.animal.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = new NextRequest('http://localhost:3000/api/weights', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001',
          weight: 50.5
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('GET /api/weights', () => {
    it('should return 401 for unauthenticated request', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/weights')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return recent weights with default limit', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
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

      const request = new NextRequest('http://localhost:3000/api/weights')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.weights).toHaveLength(50)
      expect(prisma.weightRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50
        })
      )
    })

    it('should filter weights by tag number', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.weightRecord.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          weight: 50.5,
          recordedAt: new Date(),
          animal: { tagNumber: 'A001', type: AnimalType.SHEEP }
        }
      ])

      const request = new NextRequest(
        'http://localhost:3000/api/weights?tagNumber=A001'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.weights).toHaveLength(1)
      expect(prisma.weightRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { animal: { tagNumber: 'A001' } }
        })
      )
    })

    it('should filter weights by animal ID', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.weightRecord.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          weight: 50.5,
          recordedAt: new Date(),
          animal: { tagNumber: 'A001', type: AnimalType.SHEEP }
        }
      ])

      const request = new NextRequest(
        'http://localhost:3000/api/weights?animalId=1'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.weights).toHaveLength(1)
      expect(prisma.weightRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { animalId: 1 }
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.weightRecord.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = new NextRequest('http://localhost:3000/api/weights')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
})
