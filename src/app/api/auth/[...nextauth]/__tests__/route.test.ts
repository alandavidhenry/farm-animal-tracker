/**
 * @jest-environment node
 */
import { GET, POST } from '../route'

// Mock NextAuth
jest.mock('next-auth', () => {
  const mockHandler = jest.fn()
  return jest.fn(() => mockHandler)
})

jest.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
    session: { strategy: 'jwt' }
  }
}))

describe('NextAuth API Route', () => {
  it('exports GET handler', () => {
    expect(GET).toBeDefined()
  })

  it('exports POST handler', () => {
    expect(POST).toBeDefined()
  })
})
