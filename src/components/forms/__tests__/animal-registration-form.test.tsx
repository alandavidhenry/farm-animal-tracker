import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AnimalRegistrationForm from '../animal-registration-form'

// Mock fetch
global.fetch = jest.fn()

describe('AnimalRegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all form fields', () => {
    render(<AnimalRegistrationForm />)

    expect(screen.getByLabelText(/tag number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/animal type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/initial weight/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /register animal/i })
    ).toBeInTheDocument()
  })

  it('should update form fields when user types', async () => {
    const user = userEvent.setup()
    render(<AnimalRegistrationForm />)

    const tagInput = screen.getByLabelText(/tag number/i)
    const weightInput = screen.getByLabelText(/initial weight/i)

    await user.type(tagInput, 'A001')
    await user.type(weightInput, '45.5')

    expect(tagInput).toHaveValue('A001')
    expect(weightInput).toHaveValue(45.5)
  })

  it('should select animal type from dropdown', async () => {
    const user = userEvent.setup()
    render(<AnimalRegistrationForm />)

    const typeSelect = screen.getByLabelText(/animal type/i)

    await user.selectOptions(typeSelect, 'LAMB')

    expect(typeSelect).toHaveValue('LAMB')
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Animal registered successfully',
        animal: {
          id: 1,
          tagNumber: 'A001',
          type: 'SHEEP',
          weights: [{ weight: 45.5 }]
        }
      })
    })

    render(<AnimalRegistrationForm />)

    await user.type(screen.getByLabelText(/tag number/i), 'A001')
    await user.selectOptions(screen.getByLabelText(/animal type/i), 'SHEEP')
    await user.type(screen.getByLabelText(/initial weight/i), '45.5')

    await user.click(screen.getByRole('button', { name: /register animal/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/animals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tagNumber: 'A001',
          type: 'SHEEP',
          initialWeight: '45.5',
          birthDate: null,
          notes: null
        })
      })
    })
  })

  it('should show success message on successful submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Animal registered successfully',
        animal: {
          id: 1,
          tagNumber: 'A001',
          type: 'SHEEP'
        }
      })
    })

    render(<AnimalRegistrationForm />)

    await user.type(screen.getByLabelText(/tag number/i), 'A001')
    await user.type(screen.getByLabelText(/initial weight/i), '45.5')
    await user.click(screen.getByRole('button', { name: /register animal/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/animal A001 registered successfully/i)
      ).toBeInTheDocument()
    })
  })

  it('should show error message on failed submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Animal with this tag number already exists'
      })
    })

    render(<AnimalRegistrationForm />)

    await user.type(screen.getByLabelText(/tag number/i), 'A001')
    await user.type(screen.getByLabelText(/initial weight/i), '45.5')
    await user.click(screen.getByRole('button', { name: /register animal/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/animal with this tag number already exists/i)
      ).toBeInTheDocument()
    })
  })

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Animal registered successfully',
        animal: { id: 1, tagNumber: 'A001' }
      })
    })

    render(<AnimalRegistrationForm />)

    const tagInput = screen.getByLabelText(/tag number/i)
    const weightInput = screen.getByLabelText(/initial weight/i)

    await user.type(tagInput, 'A001')
    await user.type(weightInput, '45.5')
    await user.click(screen.getByRole('button', { name: /register animal/i }))

    await waitFor(() => {
      expect(tagInput).toHaveValue('')
      expect(weightInput).toHaveValue(null)
    })
  })

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ message: 'Success' })
              }),
            100
          )
        )
    )

    render(<AnimalRegistrationForm />)

    await user.type(screen.getByLabelText(/tag number/i), 'A001')
    await user.type(screen.getByLabelText(/initial weight/i), '45.5')

    const submitButton = screen.getByRole('button', {
      name: /register animal/i
    })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /registering/i })
    ).toBeInTheDocument()

    await waitFor(
      () => {
        expect(submitButton).not.toBeDisabled()
      },
      { timeout: 200 }
    )
  })

  it('should include optional fields when provided', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' })
    })

    render(<AnimalRegistrationForm />)

    await user.type(screen.getByLabelText(/tag number/i), 'A001')
    await user.type(screen.getByLabelText(/initial weight/i), '45.5')
    await user.type(screen.getByLabelText(/birth date/i), '2025-01-01')
    await user.type(screen.getByLabelText(/notes/i), 'Healthy lamb')

    await user.click(screen.getByRole('button', { name: /register animal/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/animals',
        expect.objectContaining({
          body: JSON.stringify({
            tagNumber: 'A001',
            type: 'SHEEP',
            initialWeight: '45.5',
            birthDate: '2025-01-01',
            notes: 'Healthy lamb'
          })
        })
      )
    })
  })
})
