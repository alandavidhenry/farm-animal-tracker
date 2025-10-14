import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { signIn } from 'next-auth/react'
import SignIn from '../page'

// Get the mocked functions
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

// Import the mocked router from jest setup
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/auth/signin'
}))

// Mock getSession
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  signIn: jest.fn(),
  getSession: jest.fn()
}))

describe('SignIn Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sign in form', () => {
    render(<SignIn />)

    expect(
      screen.getByText('Sign in to Farm Animal Tracker')
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('updates email and password fields', () => {
    render(<SignIn />)

    const emailInput = screen.getByPlaceholderText(
      'Email address'
    ) as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText(
      'Password'
    ) as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('handles successful sign in', async () => {
    const { getSession } = require('next-auth/react')
    const mockGetSession = getSession as jest.MockedFunction<typeof getSession>

    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: 'http://localhost:3000'
    })

    mockGetSession.mockResolvedValue({
      user: { email: 'test@example.com', role: 'USER' },
      expires: '2025-12-31'
    })

    render(<SignIn />)

    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('handles sign in error', async () => {
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'Invalid credentials',
      status: 401,
      url: null
    })

    render(<SignIn />)

    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles exception during sign in', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'))

    render(<SignIn />)

    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred during sign in')
      ).toBeInTheDocument()
    })
  })

  it('shows loading state during sign in', async () => {
    mockSignIn.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                error: null,
                status: 200,
                url: 'http://localhost:3000'
              }),
            100
          )
        )
    )

    render(<SignIn />)

    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled()

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Signing in...' })
      ).not.toBeInTheDocument()
    })
  })
})
