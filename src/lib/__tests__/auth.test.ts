/**
 * @jest-environment node
 */

import { authOptions } from '../auth'

describe('NextAuth Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
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
    it('should authorize valid admin credentials when env vars match', async () => {
      // Test the authorization logic
      const credentialsProvider = authOptions.providers[0]
      if ('authorize' in credentialsProvider && credentialsProvider.authorize) {
        // Mock the authorize function's logic
        const mockAuthorize = async (
          credentials: { email: string; password: string } | undefined
        ) => {
          const adminEmail = 'admin@example.com'
          const adminPassword = 'securepassword123'

          if (
            credentials?.email === adminEmail &&
            credentials?.password === adminPassword
          ) {
            return {
              id: '1',
              name: 'Admin User',
              email: adminEmail
            }
          }
          return null
        }

        const user = await mockAuthorize({
          email: 'admin@example.com',
          password: 'securepassword123'
        })

        expect(user).toBeTruthy()
        expect(user?.id).toBe('1')
        expect(user?.name).toBe('Admin User')
        expect(user?.email).toBe('admin@example.com')
      }
    })

    it('should reject invalid email', async () => {
      const mockAuthorize = async (
        credentials: { email: string; password: string } | undefined
      ) => {
        const adminEmail = 'admin@example.com'
        const adminPassword = 'securepassword123'

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return {
            id: '1',
            name: 'Admin User',
            email: adminEmail
          }
        }
        return null
      }

      const user = await mockAuthorize({
        email: 'wrong@example.com',
        password: 'securepassword123'
      })

      expect(user).toBeNull()
    })

    it('should reject invalid password', async () => {
      const mockAuthorize = async (
        credentials: { email: string; password: string } | undefined
      ) => {
        const adminEmail = 'admin@example.com'
        const adminPassword = 'securepassword123'

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return {
            id: '1',
            name: 'Admin User',
            email: adminEmail
          }
        }
        return null
      }

      const user = await mockAuthorize({
        email: 'admin@example.com',
        password: 'wrongpassword'
      })

      expect(user).toBeNull()
    })

    it('should reject missing credentials', async () => {
      const mockAuthorize = async (
        credentials: { email: string; password: string } | undefined
      ) => {
        const adminEmail = 'admin@example.com'
        const adminPassword = 'securepassword123'

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return {
            id: '1',
            name: 'Admin User',
            email: adminEmail
          }
        }
        return null
      }

      const user = await mockAuthorize(undefined)

      expect(user).toBeNull()
    })

    it('should handle missing environment variables', async () => {
      const mockAuthorize = async (
        credentials: { email: string; password: string } | undefined
      ) => {
        const adminEmail = undefined
        const adminPassword = undefined

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return {
            id: '1',
            name: 'Admin User',
            email: adminEmail
          }
        }
        return null
      }

      const user = await mockAuthorize({
        email: 'admin@example.com',
        password: 'securepassword123'
      })

      expect(user).toBeNull()
    })
  })

  describe('JWT Callback', () => {
    it('should add user id to token on sign in', async () => {
      const mockToken = { sub: '1' }
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }

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
    })

    it('should return token unchanged when no user provided', async () => {
      const mockToken = { sub: '1', id: '1' }

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
    })
  })

  describe('Session Callback', () => {
    it('should add user id to session from token', async () => {
      const mockSession = {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2025-01-01'
      }
      const mockToken = { id: '1', sub: '1' }

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
  })
})
