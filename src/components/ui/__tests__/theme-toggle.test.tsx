import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ThemeToggle from '../theme-toggle'

import { ThemeProvider } from '@/contexts/theme-context'

describe('ThemeToggle', () => {
  const renderWithThemeProvider = () => {
    // Create a wrapper component that provides the theme context
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    return render(<ThemeToggle />, { wrapper: Wrapper })
  }

  it('should render theme toggle button', () => {
    renderWithThemeProvider()

    const toggleButton = screen.getByRole('switch', {
      name: /toggle dark mode/i
    })
    expect(toggleButton).toBeInTheDocument()
  })

  it('should have correct aria attributes', () => {
    renderWithThemeProvider()

    const toggleButton = screen.getByRole('switch')
    expect(toggleButton).toHaveAttribute('aria-label', 'Toggle dark mode')
    expect(toggleButton).toHaveAttribute('aria-checked')
  })

  it('should toggle theme when clicked', async () => {
    const user = userEvent.setup()
    renderWithThemeProvider()

    const toggleButton = screen.getByRole('switch')
    const initialCheckedState = toggleButton.getAttribute('aria-checked')

    await user.click(toggleButton)

    // After click, aria-checked should change
    expect(toggleButton.getAttribute('aria-checked')).not.toBe(
      initialCheckedState
    )
  })

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup()
    renderWithThemeProvider()

    const toggleButton = screen.getByRole('switch')
    toggleButton.focus()

    expect(toggleButton).toHaveFocus()

    const initialCheckedState = toggleButton.getAttribute('aria-checked')

    // Simulate Enter key press
    await user.keyboard('{Enter}')

    expect(toggleButton.getAttribute('aria-checked')).not.toBe(
      initialCheckedState
    )
  })

  it('should have focus ring styling', () => {
    renderWithThemeProvider()

    const toggleButton = screen.getByRole('switch')
    expect(toggleButton).toHaveClass('focus:ring-2')
  })
})
