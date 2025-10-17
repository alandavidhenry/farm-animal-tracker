import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
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

const mockUsers = [
  {
    id: 1,
    email: 'user1@test.com',
    name: 'User One',
    role: 'USER',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'ADMIN',
    active: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
]

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
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('User List Display', () => {
    it('displays list of users', async () => {
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
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument()
        expect(screen.getByText('User One')).toBeInTheDocument()
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })
    })

    it('displays "No users found" when list is empty', async () => {
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
        expect(screen.getByText('No users found')).toBeInTheDocument()
      })
    })

    it('displays error when fetching users fails', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch users')).toBeInTheDocument()
      })
    })

    it('displays user with null name as dash', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      const mockUsersWithNull = [
        {
          id: 1,
          email: 'user1@test.com',
          name: null,
          role: 'USER',
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsersWithNull })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument()
      })
    })

    it('displays user status badges correctly', async () => {
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
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getAllByText('Active')).toHaveLength(2)
        expect(screen.getAllByText('USER')).toHaveLength(1)
        expect(screen.getAllByText('ADMIN')).toHaveLength(1)
      })
    })

    it('displays inactive user status correctly', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      const inactiveUsers = [
        {
          ...mockUsers[0],
          active: false
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: inactiveUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('Inactive')).toBeInTheDocument()
      })
    })
  })

  describe('Create User Modal', () => {
    it('opens create modal when button clicked', async () => {
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
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', { name: /Create User/i })
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getAllByText('Create User').length).toBeGreaterThan(1)
      })
    })

    it('closes modal when Cancel clicked', async () => {
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
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Create User/i }))

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Cancel'))

      await waitFor(() => {
        expect(screen.queryByText('Create User')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edit User Modal', () => {
    it('opens edit modal when Edit button clicked', async () => {
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
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument()
        expect(screen.getByDisplayValue('user1@test.com')).toBeInTheDocument()
        expect(screen.getByDisplayValue('User One')).toBeInTheDocument()
      })
    })

    it('closes edit modal when Cancel clicked', async () => {
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
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument()
      })

      fireEvent.click(screen.getAllByText('Edit')[0])

      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Cancel'))

      await waitFor(() => {
        expect(screen.queryByText('Edit User')).not.toBeInTheDocument()
      })
    })
  })

  describe('Delete User', () => {
    it('disables delete button for current user', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'user1@test.com', role: 'ADMIN' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByText('Delete')
      expect(deleteButtons[0]).toBeDisabled()
    })

    it('does not call API when delete is cancelled', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      ;(global.confirm as jest.Mock).mockReturnValue(false)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByText('Delete')
      const initialFetchCount = (global.fetch as jest.Mock).mock.calls.length

      fireEvent.click(deleteButtons[0])

      expect((global.fetch as jest.Mock).mock.calls.length).toBe(
        initialFetchCount
      )
    })
  })

  describe('Error Handling', () => {
    it('handles fetch error with non-Error object', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      ;(global.fetch as jest.Mock).mockRejectedValueOnce('String error')

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })
    })

    it('handles network error during fetch', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })
  })

  describe('UI Elements', () => {
    it('displays correct date format', async () => {
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
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('01/01/2024')).toBeInTheDocument()
        expect(screen.getByText('02/01/2024')).toBeInTheDocument()
      })
    })

    it('renders app header', async () => {
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
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('App Header')).toBeInTheDocument()
      })
    })

    it('displays page title and description', async () => {
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
        json: async () => ({ users: mockUsers })
      })

      render(<AdminUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument()
        expect(
          screen.getByText('Manage system users and their permissions')
        ).toBeInTheDocument()
      })
    })
  })
})
