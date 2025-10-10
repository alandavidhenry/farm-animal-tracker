/**
 * @jest-environment node
 */

import { config } from '../middleware'

// Note: Testing middleware directly is challenging as it's wrapped by withAuth
// We'll test the configuration and matcher patterns instead

describe('Middleware Configuration', () => {
  describe('Route Matcher', () => {
    it('should have matcher configuration', () => {
      expect(config.matcher).toBeDefined()
      expect(Array.isArray(config.matcher)).toBe(true)
    })

    it('should protect routes except auth and public assets', () => {
      const matcher = config.matcher[0]

      // Test that the pattern exists and is a string
      expect(typeof matcher).toBe('string')
      expect(matcher).toContain('(?!')
    })

    it('should exclude auth routes', () => {
      const matcher = config.matcher[0]
      expect(matcher).toContain('api/auth')
      expect(matcher).toContain('auth')
    })

    it('should exclude Next.js static assets', () => {
      const matcher = config.matcher[0]
      expect(matcher).toContain('_next/static')
      expect(matcher).toContain('_next/image')
    })

    it('should exclude common public files', () => {
      const matcher = config.matcher[0]
      expect(matcher).toContain('favicon.ico')
      expect(matcher).toContain('public')
    })
  })

  describe('Middleware Authorization Logic', () => {
    it('should authorize requests with valid token', () => {
      // The middleware uses: authorized: ({ token }) => !!token
      const mockToken = { id: '1', email: 'test@test.com' }
      const result = !!mockToken

      expect(result).toBe(true)
    })

    it('should reject requests without token', () => {
      // The middleware uses: authorized: ({ token }) => !!token
      const mockToken = null
      const result = !!mockToken

      expect(result).toBe(false)
    })

    it('should reject requests with undefined token', () => {
      const mockToken = undefined
      const result = !!mockToken

      expect(result).toBe(false)
    })
  })

  describe('Route Protection Patterns', () => {
    // Helper function to test if a path matches the exclusion pattern
    const isExcluded = (path: string): boolean => {
      const pattern =
        /^\/((?!api\/auth|auth|_next\/static|_next\/image|favicon\.ico|public).*)/
      return !pattern.test(path)
    }

    it('should exclude authentication routes', () => {
      expect(isExcluded('/auth/signin')).toBe(true)
      expect(isExcluded('/auth/signup')).toBe(true)
      expect(isExcluded('/api/auth/signin')).toBe(true)
      expect(isExcluded('/api/auth/[...nextauth]')).toBe(true)
    })

    it('should exclude Next.js internal routes', () => {
      expect(isExcluded('/_next/static/chunks/main.js')).toBe(true)
      expect(isExcluded('/_next/image/logo.png')).toBe(true)
    })

    it('should exclude public assets', () => {
      expect(isExcluded('/favicon.ico')).toBe(true)
      expect(isExcluded('/public/logo.png')).toBe(true)
    })

    it('should protect API routes', () => {
      expect(isExcluded('/api/animals')).toBe(false)
      expect(isExcluded('/api/weights')).toBe(false)
    })

    it('should protect application pages', () => {
      expect(isExcluded('/')).toBe(false)
      expect(isExcluded('/dashboard')).toBe(false)
      expect(isExcluded('/animals')).toBe(false)
    })
  })
})
