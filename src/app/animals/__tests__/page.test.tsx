import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import AnimalsPage from '../page'

jest.mock('next-auth/react')
jest.mock('@/components/ui/app-header', () => {
  return function AppHeader() {
    return <div data-testid='app-header'>App Header</div>
  }
})

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock global fetch
global.fetch = jest.fn()

describe('AnimalsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn()
    })

    render(<AnimalsPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('fetches and displays animals when authenticated', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    const mockAnimals = [
      {
        id: 1,
        tagNumber: 'TAG001',
        type: 'SHEEP',
        birthDate: '2024-01-15',
        createdAt: '2024-06-01',
        weights: [{ weight: 45.5, recordedAt: '2024-10-14' }]
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ animals: mockAnimals })
    })

    render(<AnimalsPage />)

    await waitFor(() => {
      expect(screen.getByText('TAG001')).toBeInTheDocument()
      expect(screen.getByText('SHEEP')).toBeInTheDocument()
      expect(screen.getByText('45.5 kg')).toBeInTheDocument()
    })
  })

  it('shows no animals message when list is empty', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ animals: [] })
    })

    render(<AnimalsPage />)

    await waitFor(() => {
      expect(screen.getByText('No animals registered yet.')).toBeInTheDocument()
      expect(screen.getByText('Register your first animal')).toBeInTheDocument()
    })
  })

  it('handles fetch error', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    })

    render(<AnimalsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch animals/)).toBeInTheDocument()
    })
  })

  it('allows searching by tag number', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ animals: [] })
    })

    render(<AnimalsPage />)

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search by tag number...')
      ).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by tag number...')
    const searchButton = screen.getByRole('button', { name: 'Search' })

    fireEvent.change(searchInput, { target: { value: 'TAG001' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/animals?tagNumber=TAG001')
    })
  })

  it('shows clear button when search query is present', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ animals: [] })
    })

    render(<AnimalsPage />)

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search by tag number...')
      ).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by tag number...')

    fireEvent.change(searchInput, { target: { value: 'TAG001' } })

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ animals: [] })
    })

    render(<AnimalsPage />)

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search by tag number...')
      ).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'Search by tag number...'
    ) as HTMLInputElement

    fireEvent.change(searchInput, { target: { value: 'TAG001' } })

    const clearButton = screen.getByRole('button', { name: 'Clear' })
    fireEvent.click(clearButton)

    expect(searchInput.value).toBe('')
  })
})
