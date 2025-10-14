import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import RecordWeightPage from '../page'

jest.mock('next-auth/react')
jest.mock('@/components/ui/app-header', () => {
  return function AppHeader() {
    return <div data-testid='app-header'>App Header</div>
  }
})

jest.mock('@/components/forms/weight-recording-form', () => {
  return function WeightRecordingForm() {
    return <div data-testid='weight-recording-form'>Weight Recording Form</div>
  }
})

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('RecordWeightPage', () => {
  it('shows loading when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn()
    })

    render(<RecordWeightPage />)

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

    render(<RecordWeightPage />)

    expect(screen.getByTestId('app-header')).toBeInTheDocument()
    expect(screen.getByText('Record Animal Weight')).toBeInTheDocument()
  })
})
