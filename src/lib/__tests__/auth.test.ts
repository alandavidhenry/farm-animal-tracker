/**
 * @jest-environment node
 */

import bcrypt from 'bcryptjs'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}))

// Mock bcrypt
jest.mock('bcryptjs')

import { authOptions } from '../auth'
import { prisma } from '../prisma'

describe('NextAuth Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('authOptions', () => {
    it('should have correct configuration structure', () => {
      expect(authOptions).toBeDefined()
      expect(authOptions.providers).toBeDefined()
      expect(authOptions.session).toBeDefined()
      expect(authOptions.pages).toBeDefined()
      expect(authOptions.callbacks).toBeDefined()
    })

    it('should use JWT session strategy', () => {
      expect(authOptions.session.strategy).toBe('jwt')
    })

    it('should have custom sign-in page configured', () => {
      expect(authOptions.pages?.signIn).toBe('/auth/signin')
    })

    it('should have credentials provider configured', () => {
      expect(authOptions.providers).toHaveLength(1)
      const provider = authOptions.providers[0]
      expect(provider.id).toBe('credentials')
    })
  })

  describe('Credentials Provider - authorize', () => {
    it('should have authorize function defined', () => {
      const credentialsProvider = authOptions.providers[0]

      expect('authorize' in credentialsProvider).toBe(true)
      expect(typeof credentialsProvider.authorize).toBe('function')
    })

    it('should reject user with invalid password', async () => {
      const credentialsProvider = authOptions.providers[0]

      if ('authorize' in credentialsProvider && credentialsProvider.authorize) {
        const mockUser = {
          id: 1,
          email: 'user@test.com',
          password: 'hashedPassword123',
          name: 'Test User',
          role: 'USER',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
        ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

        const user = await credentialsProvider.authorize(
          {
            email: 'user@test.com',
            password: 'wrongpassword'
          },
          {} as any
        )

        expect(user).toBeNull()
      }
    })

    it('should reject inactive user', async () => {
      const credentialsProvider = authOptions.providers[0]

      if ('authorize' in credentialsProvider && credentialsProvider.authorize) {
        const mockUser = {
          id: 1,
          email: 'user@test.com',
          password: 'hashedPassword123',
          name: 'Test User',
          role: 'USER',
          active: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

        const user = await credentialsProvider.authorize(
          {
            email: 'user@test.com',
            password: 'password123'
          },
          {} as any
        )

        expect(user).toBeNull()
      }
    })

    it('should reject non-existent user', async () => {
      const credentialsProvider = authOptions.providers[0]

      if ('authorize' in credentialsProvider && credentialsProvider.authorize) {
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

        const user = await credentialsProvider.authorize(
          {
            email: 'nonexistent@test.com',
            password: 'password123'
          },
          {} as any
        )

        expect(user).toBeNull()
      }
    })

    it('should reject missing credentials', async () => {
      const credentialsProvider = authOptions.providers[0]

      if ('authorize' in credentialsProvider && credentialsProvider.authorize) {
        const user = await credentialsProvider.authorize(
          {
            email: '',
            password: ''
          },
          {} as any
        )

        expect(user).toBeNull()
      }
    })

    it('should reject missing email', async () => {
      const credentialsProvider = authOptions.providers[0]

      if ('authorize' in credentialsProvider && credentialsProvider.authorize) {
        const user = await credentialsProvider.authorize(
          {
            email: '',
            password: 'password123'
          },
          {} as any
        )

        expect(user).toBeNull()
      }
    })

    it('should reject missing password', async () => {
      const credentialsProvider = authOptions.providers[0]

      if ('authorize' in credentialsProvider && credentialsProvider.authorize) {
        const user = await credentialsProvider.authorize(
          {
            email: 'user@test.com',
            password: ''
          },
          {} as any
        )

        expect(user).toBeNull()
      }
    })
  })

  describe('JWT Callback', () => {
    it('should add user id and role to token on sign in', async () => {
      const mockToken = { sub: '1' }
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER'
      }

      const result = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        user: mockUser,
        trigger: 'signIn',
        account: null,
        profile: undefined,
        isNewUser: undefined
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('1')
      expect(result?.role).toBe('USER')
    })

    it('should return token unchanged when no user provided', async () => {
      const mockToken = { sub: '1', id: '1', role: 'USER' }

      const result = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        trigger: 'update',
        account: null,
        profile: undefined,
        isNewUser: undefined,
        user: undefined
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('1')
      expect(result?.role).toBe('USER')
    })
  })

  describe('Session Callback', () => {
    it('should add user id and role to session from token', async () => {
      const mockSession = {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2025-01-01'
      }
      const mockToken = { id: '1', sub: '1', role: 'USER' }

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: mockToken,
        trigger: 'getSession',
        newSession: undefined,
        user: undefined
      })

      expect(result).toBeDefined()
      expect(result?.user?.id).toBe('1')
      expect(result?.user?.email).toBe('test@example.com')
      expect(result?.user?.role).toBe('USER')
    })

    it('should handle missing token gracefully', async () => {
      const mockSession = {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2025-01-01'
      }

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: {},
        trigger: 'getSession',
        newSession: undefined,
        user: undefined
      })

      expect(result).toBeDefined()
      expect(result?.user).toBeDefined()
    })

    it('should handle admin role correctly', async () => {
      const mockSession = {
        user: { name: 'Admin User', email: 'admin@example.com' },
        expires: '2025-01-01'
      }
      const mockToken = { id: '1', sub: '1', role: 'ADMIN' }

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: mockToken,
        trigger: 'getSession',
        newSession: undefined,
        user: undefined
      })

      expect(result).toBeDefined()
      expect(result?.user?.role).toBe('ADMIN')
    })
  })
})
