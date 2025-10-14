import { render, screen, fireEvent } from '@testing-library/react'
import { useSession, signOut } from 'next-auth/react'
import AppHeader from '../app-header'

// Mock next-auth
jest.mock('next-auth/react')

// Mock ThemeToggle component
jest.mock('../theme-toggle', () => {
  return function ThemeToggle() {
    return <button data-testid='theme-toggle'>Toggle Theme</button>
  }
})

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

describe('AppHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with title', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    expect(screen.getByText('Farm Animal Tracker')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    expect(screen.getByText('Register Animal')).toBeInTheDocument()
    expect(screen.getByText('Record Weight')).toBeInTheDocument()
    expect(screen.getByText('View Animals')).toBeInTheDocument()
  })

  it('renders theme toggle', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    expect(screen.getAllByTestId('theme-toggle')).toHaveLength(2) // Desktop and mobile
  })

  it('shows user email and sign out button when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'user@example.com',
          role: 'USER'
        },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    expect(screen.getByText('user@example.com')).toBeInTheDocument()
    // Desktop sign out button is visible
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
  })

  it('shows admin link when user is admin', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'admin@example.com',
          role: 'ADMIN'
        },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    // Desktop admin link is visible
    expect(screen.getByText('Manage Users')).toBeInTheDocument()
  })

  it('does not show admin link for regular users', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'user@example.com',
          role: 'USER'
        },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    expect(screen.queryByText('Manage Users')).not.toBeInTheDocument()
  })

  it('calls signOut when sign out button is clicked', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'user@example.com',
          role: 'USER'
        },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    const signOutButton = screen.getByRole('button', { name: 'Sign Out' })
    fireEvent.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('toggles mobile menu when menu button is clicked', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    const menuButton = screen.getByLabelText('Toggle menu')

    // Initially, mobile menu should not be visible
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    // Click to open mobile menu
    fireEvent.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Click again to close mobile menu
    fireEvent.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes mobile menu when navigation link is clicked', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    const menuButton = screen.getByLabelText('Toggle menu')

    // Open mobile menu
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Find and click a navigation link
    const navLinks = screen.getAllByText('Register Animal')
    // Click any available link
    fireEvent.click(navLinks[0])

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes mobile menu when sign out is clicked in mobile menu', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'user@example.com',
          role: 'USER'
        },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<AppHeader />)

    const menuButton = screen.getByLabelText('Toggle menu')

    // Open mobile menu
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Find and click any sign out button
    const signOutButtons = screen.getAllByText('Sign Out')
    fireEvent.click(signOutButtons[0])

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('renders correct icon when mobile menu is open', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    const { container } = render(<AppHeader />)

    const menuButton = screen.getByLabelText('Toggle menu')

    // Initially showing hamburger menu icon
    let paths = container.querySelectorAll('path')
    expect(paths[0]).toHaveAttribute('d', 'M4 6h16M4 12h16M4 18h16')

    // Click to open - should show X icon
    fireEvent.click(menuButton)

    paths = container.querySelectorAll('path')
    expect(paths[0]).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12')
  })
})
