import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import RegisterAnimalPage from '../page'

jest.mock('next-auth/react')
jest.mock('@/components/ui/app-header', () => {
  return function AppHeader() {
    return <div data-testid='app-header'>App Header</div>
  }
})

jest.mock('@/components/forms/animal-registration-form', () => {
  return function AnimalRegistrationForm() {
    return <div data-testid='animal-registration-form'>Registration Form</div>
  }
})

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('RegisterAnimalPage', () => {
  it('shows loading when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn()
    })

    render(<RegisterAnimalPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders page with form when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'user@test.com', role: 'USER' },
        expires: '2025-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(<RegisterAnimalPage />)

    expect(screen.getByTestId('app-header')).toBeInTheDocument()
    expect(screen.getByText('Register New Animal')).toBeInTheDocument()
    expect(screen.getByTestId('animal-registration-form')).toBeInTheDocument()
  })
})
