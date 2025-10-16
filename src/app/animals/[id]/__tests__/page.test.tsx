import { render, screen, waitFor, act } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'

import AnimalDetailPage from '../page'

// Mock dependencies
jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useParams: jest.fn()
}))
jest.mock('@/components/ui/app-header', () => ({
  __esModule: true,
  default: () => <div>App Header</div>
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>

global.fetch = jest.fn()

describe('AnimalDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Authentication', () => {
    it('renders loading state when there is no session', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn()
      })

      mockUseParams.mockReturnValue({ id: '1' })

      render(<AnimalDetailPage />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('does not fetch data when session is null', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      })

      mockUseParams.mockReturnValue({ id: '1' })

      render(<AnimalDetailPage />)
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Fetching Animal Details', () => {
    it('fetches and displays animal details successfully', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'user@test.com', role: 'USER' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      mockUseParams.mockReturnValue({ id: '1' })

      const mockAnimal = {
        id: 1,
        tagNumber: 'SHEEP001',
        type: 'SHEEP',
        birthDate: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z'
      }

      const mockWeights = [
        {
          id: 1,
          weight: 45.5,
          recordedAt: '2024-01-15T10:00:00Z',
          notes: 'First weight'
        },
        {
          id: 2,
          weight: 40.0,
          recordedAt: '2024-01-01T10:00:00Z',
          notes: null
        }
      ]

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ animals: [mockAnimal] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ weights: mockWeights })
        })

      await act(async () => {
        render(<AnimalDetailPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('SHEEP001')).toBeInTheDocument()
        expect(screen.getByText('SHEEP')).toBeInTheDocument()
        expect(screen.getAllByText('45.5 kg')[0]).toBeInTheDocument()
        expect(screen.getByText('First weight')).toBeInTheDocument()
      })
    })

    it('displays error when animal is not found', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'user@test.com', role: 'USER' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      mockUseParams.mockReturnValue({ id: '999' })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ animals: [] })
      })

      await act(async () => {
        render(<AnimalDetailPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Animal not found')).toBeInTheDocument()
      })
    })

    it('displays error when fetching animals fails', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'user@test.com', role: 'USER' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      mockUseParams.mockReturnValue({ id: '1' })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      })

      await act(async () => {
        render(<AnimalDetailPage />)
      })

      await waitFor(() => {
        expect(
          screen.getByText('Failed to fetch animal data')
        ).toBeInTheDocument()
      })
    })

    it('displays error when fetching weights fails', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'user@test.com', role: 'USER' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      mockUseParams.mockReturnValue({ id: '1' })

      const mockAnimal = {
        id: 1,
        tagNumber: 'SHEEP001',
        type: 'SHEEP',
        birthDate: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z'
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ animals: [mockAnimal] })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({})
        })

      await act(async () => {
        render(<AnimalDetailPage />)
      })

      await waitFor(() => {
        expect(
          screen.getByText('Failed to fetch weight history')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Animal Information Display', () => {
    it('displays birth date when available', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'user@test.com', role: 'USER' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      mockUseParams.mockReturnValue({ id: '1' })

      const mockAnimal = {
        id: 1,
        tagNumber: 'SHEEP001',
        type: 'SHEEP',
        birthDate: '2023-03-15T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z'
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ animals: [mockAnimal] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ weights: [] })
        })

      await act(async () => {
        render(<AnimalDetailPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('15/03/2023')).toBeInTheDocument()
      })
    })

    it('displays "Not recorded" when birth date is null', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'user@test.com', role: 'USER' },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      mockUseParams.mockReturnValue({ id: '1' })

      const mockAnimal = {
        id: 1,
        tagNumber: 'SHEEP001',
        type: 'SHEEP',
        birthDate: null,
        createdAt: '2023-01-01T00:00:00Z'
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ animals: [mockAnimal] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ weights: [] })
        })

      await act(async () => {
        render(<AnimalDetailPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Not recorded')).toBeInTheDocument()
      })
    })
  })
})
