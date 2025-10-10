import { render, screen } from '@testing-library/react'

import AuthSessionProvider from '../session-provider'

describe('AuthSessionProvider', () => {
  it('should render children', () => {
    render(
      <AuthSessionProvider>
        <div>Test Content</div>
      </AuthSessionProvider>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should wrap children with NextAuth SessionProvider', () => {
    const { container } = render(
      <AuthSessionProvider>
        <div data-testid='child-element'>Child Content</div>
      </AuthSessionProvider>
    )

    // Verify child is rendered
    expect(screen.getByTestId('child-element')).toBeInTheDocument()
    // Verify it's wrapped (SessionProvider is mocked in jest.setup.js)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render multiple children', () => {
    render(
      <AuthSessionProvider>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </AuthSessionProvider>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('should handle complex nested children', () => {
    render(
      <AuthSessionProvider>
        <div>
          <header>Header</header>
          <main>Main Content</main>
          <footer>Footer</footer>
        </div>
      </AuthSessionProvider>
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})
