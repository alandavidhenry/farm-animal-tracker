import { render } from '@testing-library/react'
import RootLayout from '../layout'

// Mock the providers and fonts
jest.mock('@/components/auth/session-provider', () => {
  return function AuthSessionProvider({
    children
  }: {
    children: React.ReactNode
  }) {
    return <div data-testid='auth-provider'>{children}</div>
  }
})

jest.mock('@/contexts/theme-context', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='theme-provider'>{children}</div>
    )
  }
})

jest.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
    subsets: ['latin']
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
    subsets: ['latin']
  })
}))

describe('RootLayout', () => {
  // Suppress console errors for HTML nesting warnings in tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('renders children within the layout', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test Child Content</div>
      </RootLayout>
    )

    expect(getByText('Test Child Content')).toBeInTheDocument()
  })

  it('wraps children in ThemeProvider', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    expect(getByTestId('theme-provider')).toBeInTheDocument()
  })

  it('wraps children in AuthSessionProvider', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    expect(getByTestId('auth-provider')).toBeInTheDocument()
  })

  it('nests providers correctly (ThemeProvider > AuthSessionProvider)', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid='child-content'>Test Content</div>
      </RootLayout>
    )

    const themeProvider = getByTestId('theme-provider')
    const authProvider = getByTestId('auth-provider')
    const childContent = getByTestId('child-content')

    // ThemeProvider should contain AuthSessionProvider
    expect(themeProvider).toContainElement(authProvider)
    // AuthSessionProvider should contain child content
    expect(authProvider).toContainElement(childContent)
  })
})
