/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

import { GET, PATCH, DELETE } from '../route'
import { prisma } from '@/lib/prisma'

jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))
jest.mock('bcryptjs')

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>
const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>

describe('Admin Users [id] API - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/admin/users/1')
    const response = await GET(request, {
      params: Promise.resolve({ id: '1' })
    })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 if user is not an admin', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'user@test.com', role: 'USER' },
      expires: '2025-12-31'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/users/1')
    const response = await GET(request, {
      params: Promise.resolve({ id: '1' })
    })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 for invalid user ID', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/users/abc')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'abc' })
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid user ID')
  })

  it('returns 404 if user not found', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/admin/users/999')
    const response = await GET(request, {
      params: Promise.resolve({ id: '999' })
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('returns user successfully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })

    const mockUser = {
      id: 2,
      email: 'user@test.com',
      name: 'Test User',
      role: 'USER',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost:3000/api/admin/users/2')
    const response = await GET(request, {
      params: Promise.resolve({ id: '2' })
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe('user@test.com')
    expect(data.user.name).toBe('Test User')
    expect(data.user.role).toBe('USER')
  })

  it('returns 500 on database error', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new NextRequest('http://localhost:3000/api/admin/users/2')
    const response = await GET(request, {
      params: Promise.resolve({ id: '2' })
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch user')
  })
})

describe('Admin Users [id] API - PATCH', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Name' })
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '1' })
    })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 for invalid user ID', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })

    const request = new NextRequest(
      'http://localhost:3000/api/admin/users/abc',
      {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' })
      }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'abc' })
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid user ID')
  })

  it('returns 404 if user not found', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/admin/users/999',
      {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' })
      }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '999' })
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('returns 400 when admin tries to deactivate themselves', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'admin@test.com'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
      method: 'PATCH',
      body: JSON.stringify({ active: false })
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '1' })
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('You cannot deactivate your own account')
  })

  it('returns 400 if email is already taken', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({
        id: 2,
        email: 'user@test.com'
      })
      .mockResolvedValueOnce({
        id: 3,
        email: 'taken@test.com'
      })

    const request = new NextRequest('http://localhost:3000/api/admin/users/2', {
      method: 'PATCH',
      body: JSON.stringify({ email: 'taken@test.com' })
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '2' })
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email already in use')
  })

  it('updates user successfully with all fields', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })

    const existingUser = {
      id: 2,
      email: 'user@test.com'
    }

    ;(prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(existingUser)
      .mockResolvedValueOnce(null) // Email not taken

    mockBcryptHash.mockResolvedValue('newHashedPassword' as never)

    const updatedUser = {
      id: 2,
      email: 'newemail@test.com',
      name: 'Updated Name',
      role: 'ADMIN',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    ;(prisma.user.update as jest.Mock).mockResolvedValue(updatedUser)

    const request = new NextRequest('http://localhost:3000/api/admin/users/2', {
      method: 'PATCH',
      body: JSON.stringify({
        email: 'newemail@test.com',
        name: 'Updated Name',
        password: 'newPassword',
        role: 'ADMIN',
        active: true
      })
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '2' })
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe('newemail@test.com')
    expect(data.user.name).toBe('Updated Name')
    expect(data.user.role).toBe('ADMIN')
    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10)
  })

  it('updates only specified fields', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      email: 'user@test.com'
    })

    const updatedUser = {
      id: 2,
      email: 'user@test.com',
      name: 'New Name',
      role: 'USER',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    ;(prisma.user.update as jest.Mock).mockResolvedValue(updatedUser)

    const request = new NextRequest('http://localhost:3000/api/admin/users/2', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'New Name'
      })
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '2' })
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe('user@test.com')
    expect(data.user.name).toBe('New Name')
  })

  it('returns 500 on database error', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      email: 'user@test.com'
    })
    ;(prisma.user.update as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new NextRequest('http://localhost:3000/api/admin/users/2', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Name' })
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '2' })
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update user')
  })
})

describe('Admin Users [id] API - DELETE', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
      method: 'DELETE'
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: '1' })
    })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 for invalid user ID', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })

    const request = new NextRequest(
      'http://localhost:3000/api/admin/users/abc',
      {
        method: 'DELETE'
      }
    )

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'abc' })
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid user ID')
  })

  it('returns 400 when admin tries to delete themselves', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
      method: 'DELETE'
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: '1' })
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('You cannot delete your own account')
  })

  it('returns 404 if user not found', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/admin/users/999',
      {
        method: 'DELETE'
      }
    )

    const response = await DELETE(request, {
      params: Promise.resolve({ id: '999' })
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('deletes user successfully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      email: 'user@test.com'
    })
    ;(prisma.user.delete as jest.Mock).mockResolvedValue({ id: 2 })

    const request = new NextRequest('http://localhost:3000/api/admin/users/2', {
      method: 'DELETE'
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: '2' })
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('User deleted successfully')
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 2 }
    })
  })

  it('returns 500 on database error', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2025-12-31'
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      email: 'user@test.com'
    })
    ;(prisma.user.delete as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new NextRequest('http://localhost:3000/api/admin/users/2', {
      method: 'DELETE'
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: '2' })
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to delete user')
  })
})
