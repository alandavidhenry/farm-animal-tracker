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
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn()
    }
  }
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>

describe('Animals API Route Handlers - Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/animals', () => {
    it('should return 401 for unauthenticated request', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/animals', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001',
          type: AnimalType.SHEEP,
          initialWeight: 45.5
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

      const request = new NextRequest('http://localhost:3000/api/animals', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001'
          // Missing type and initialWeight
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    it('should return 400 for invalid animal type', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })

      const request = new NextRequest('http://localhost:3000/api/animals', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001',
          type: 'INVALID_TYPE',
          initialWeight: 45.5
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid animal type')
    })

    it('should return 409 for duplicate tag number', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.animal.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        tagNumber: 'A001'
      })

      const request = new NextRequest('http://localhost:3000/api/animals', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001',
          type: AnimalType.SHEEP,
          initialWeight: 45.5
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('already exists')
    })

    it('should successfully create animal with initial weight', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.animal.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.animal.create as jest.Mock).mockResolvedValue({
        id: 1,
        tagNumber: 'A001',
        type: AnimalType.SHEEP,
        birthDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        motherId: null,
        weights: [
          {
            id: 1,
            animalId: 1,
            weight: 45.5,
            recordedAt: new Date(),
            notes: 'Initial weight for A001'
          }
        ]
      })

      const request = new NextRequest('http://localhost:3000/api/animals', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001',
          type: AnimalType.SHEEP,
          initialWeight: 45.5
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Animal registered successfully')
      expect(data.animal.tagNumber).toBe('A001')
      expect(data.animal.weights).toHaveLength(1)
    })

    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.animal.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = new NextRequest('http://localhost:3000/api/animals', {
        method: 'POST',
        body: JSON.stringify({
          tagNumber: 'A001',
          type: AnimalType.SHEEP,
          initialWeight: 45.5
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('GET /api/animals', () => {
    it('should return 401 for unauthenticated request', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/animals')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return all animals with latest weight', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
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

      const request = new NextRequest('http://localhost:3000/api/animals')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.animals).toHaveLength(2)
      expect(data.animals[0].tagNumber).toBe('A001')
      expect(data.animals[1].tagNumber).toBe('A002')
    })

    it('should filter animals by tag number', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.animal.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          tagNumber: 'A001',
          type: AnimalType.SHEEP,
          weights: [{ id: 1, weight: 45.5, recordedAt: new Date() }]
        }
      ])

      const request = new NextRequest(
        'http://localhost:3000/api/animals?tagNumber=A001'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.animals).toHaveLength(1)
      expect(data.animals[0].tagNumber).toBe('A001')
      expect(prisma.animal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tagNumber: { contains: 'A001' } }
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@test.com' }
      })
      ;(prisma.animal.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = new NextRequest('http://localhost:3000/api/animals')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
})
