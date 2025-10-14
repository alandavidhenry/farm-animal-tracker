/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

import { GET, POST } from '../route'
import { prisma } from '@/lib/prisma'

jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }
}))
jest.mock('bcryptjs')

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>
const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>

describe('Admin Users API - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 if user is not an admin', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'user@test.com', role: 'USER' },
      expires: '2025-12-31'
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns list of users for admin', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })

    const mockUsers = [
      {
        id: 1,
        email: 'user1@test.com',
        name: 'User 1',
        role: 'USER',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        email: 'user2@test.com',
        name: 'User 2',
        role: 'USER',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.users).toHaveLength(2)
    expect(data.users[0].email).toBe('user1@test.com')
    expect(data.users[1].email).toBe('user2@test.com')
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  })

  it('returns 500 on database error', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch users')
  })
})

describe('Admin Users API - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@test.com',
        password: 'password123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 if user is not an admin', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'user@test.com', role: 'USER' },
      expires: '2025-12-31'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@test.com',
        password: 'password123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 if email is missing', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        password: 'password123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email and password are required')
  })

  it('returns 400 if password is missing', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@test.com'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email and password are required')
  })

  it('returns 400 if user already exists', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      email: 'existing@test.com'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@test.com',
        password: 'password123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('User with this email already exists')
  })

  it('creates new user successfully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    mockBcryptHash.mockResolvedValue('hashedPassword' as never)

    const mockCreatedUser = {
      id: 3,
      email: 'newuser@test.com',
      name: 'New User',
      role: 'USER',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser)

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@test.com',
        name: 'New User',
        password: 'password123',
        role: 'USER',
        active: true
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.email).toBe('newuser@test.com')
    expect(data.user.name).toBe('New User')
    expect(data.user.role).toBe('USER')
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'newuser@test.com',
        name: 'New User',
        password: 'hashedPassword',
        role: 'USER',
        active: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })
  })

  it('creates user with default values when optional fields are missing', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    mockBcryptHash.mockResolvedValue('hashedPassword' as never)

    const mockCreatedUser = {
      id: 4,
      email: 'minimal@test.com',
      name: null,
      role: 'USER',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser)

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'minimal@test.com',
        password: 'password123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.email).toBe('minimal@test.com')
    expect(data.user.role).toBe('USER')
    expect(data.user.active).toBe(true)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'minimal@test.com',
        name: null,
        password: 'hashedPassword',
        role: 'USER',
        active: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })
  })

  it('returns 500 on database error', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    mockBcryptHash.mockResolvedValue('hashedPassword' as never)
    ;(prisma.user.create as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@test.com',
        password: 'password123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create user')
  })
})
