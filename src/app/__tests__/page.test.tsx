import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import Home from '../page'

jest.mock('next-auth/react')
jest.mock('@/components/ui/app-header', () => {
  return function AppHeader() {
    return <div data-testid='app-header'>App Header</div>
  }
})

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('Home Page', () => {
  it('shows loading when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn()
    })

    render(<Home />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders welcome message when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<Home />)

    expect(screen.getByText('Welcome back!')).toBeInTheDocument()
    expect(screen.getByTestId('app-header')).toBeInTheDocument()
  })

  it('renders quick action cards', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<Home />)

    expect(screen.getByText('Register Animal')).toBeInTheDocument()
    expect(screen.getByText('Record Weight')).toBeInTheDocument()
    expect(screen.getByText('View Animals')).toBeInTheDocument()
  })

  it('renders getting started section', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<Home />)

    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(
      screen.getByText(/Start by registering your animals/)
    ).toBeInTheDocument()
  })

  it('renders links with correct hrefs', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<Home />)

    const registerLink = screen.getByRole('link', { name: /Register Animal/i })
    const weightLink = screen.getByRole('link', { name: /Record Weight/i })
    const viewLink = screen.getByRole('link', { name: /View Animals/i })

    expect(registerLink).toHaveAttribute('href', '/animals/register')
    expect(weightLink).toHaveAttribute('href', '/weights/record')
    expect(viewLink).toHaveAttribute('href', '/animals')
  })
})
