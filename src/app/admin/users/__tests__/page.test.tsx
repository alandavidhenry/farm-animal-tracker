import { render, screen, waitFor, act } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import AdminUsersPage from '../page'

const mockPush = jest.fn()

// Mock dependencies
jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  })
}))
jest.mock('@/components/ui/app-header', () => ({
  __esModule: true,
  default: () => <div>App Header</div>
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

global.fetch = jest.fn()
global.confirm = jest.fn()

describe('AdminUsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
    ;(global.confirm as jest.Mock).mockClear()
    mockPush.mockClear()
  })

  describe('Authentication and Authorization', () => {
    it('renders loading state when session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn()
      })

      render(<AdminUsersPage />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('redirects non-admin users to home page', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'user@test.com', role: 'USER' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('shows loading for non-admin users before redirect', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'user@test.com', role: 'USER' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      render(<AdminUsersPage />)

      // Initially shows loading, then redirects
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Component Rendering', () => {
    it('renders admin page title when authenticated as admin', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument()
      })

      expect(screen.getByText('Create User')).toBeInTheDocument()
    })
  })
})
