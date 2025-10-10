import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import WeightRecordingForm from '../weight-recording-form'

// Mock fetch
global.fetch = jest.fn()

describe('WeightRecordingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all form fields', () => {
    render(<WeightRecordingForm />)

    expect(screen.getByLabelText(/animal tag number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^weight/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /record weight/i })
    ).toBeInTheDocument()
  })

  it('should display current date and time', () => {
    render(<WeightRecordingForm />)

    expect(screen.getByText(/recording date:/i)).toBeInTheDocument()
    expect(screen.getByText(/recording time:/i)).toBeInTheDocument()
  })

  it('should update form fields when user types', async () => {
    const user = userEvent.setup()
    render(<WeightRecordingForm />)

    const tagInput = screen.getByLabelText(/animal tag number/i)
    const weightInput = screen.getByLabelText(/^weight/i)

    await user.type(tagInput, 'A001')
    await user.type(weightInput, '52.3')

    expect(tagInput).toHaveValue('A001')
    expect(weightInput).toHaveValue(52.3)
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Weight recorded successfully',
        weightRecord: {
          id: 1,
          weight: 52.3,
          animal: { tagNumber: 'A001', type: 'SHEEP' }
        }
      })
    })

    render(<WeightRecordingForm />)

    await user.type(screen.getByLabelText(/animal tag number/i), 'A001')
    await user.type(screen.getByLabelText(/^weight/i), '52.3')

    await user.click(screen.getByRole('button', { name: /record weight/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tagNumber: 'A001',
          weight: '52.3',
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
        message: 'Weight recorded successfully',
        weightRecord: {
          id: 1,
          weight: 52.3,
          animal: { tagNumber: 'A001' }
        }
      })
    })

    render(<WeightRecordingForm />)

    await user.type(screen.getByLabelText(/animal tag number/i), 'A001')
    await user.type(screen.getByLabelText(/^weight/i), '52.3')
    await user.click(screen.getByRole('button', { name: /record weight/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/weight recorded for animal A001: 52.3kg/i)
      ).toBeInTheDocument()
    })
  })

  it('should show error message on failed submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Animal not found with this tag number'
      })
    })

    render(<WeightRecordingForm />)

    await user.type(screen.getByLabelText(/animal tag number/i), 'A999')
    await user.type(screen.getByLabelText(/^weight/i), '52.3')
    await user.click(screen.getByRole('button', { name: /record weight/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/animal not found with this tag number/i)
      ).toBeInTheDocument()
    })
  })

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Weight recorded successfully',
        weightRecord: { id: 1, weight: 52.3 }
      })
    })

    render(<WeightRecordingForm />)

    const tagInput = screen.getByLabelText(/animal tag number/i)
    const weightInput = screen.getByLabelText(/^weight/i)

    await user.type(tagInput, 'A001')
    await user.type(weightInput, '52.3')
    await user.click(screen.getByRole('button', { name: /record weight/i }))

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

    render(<WeightRecordingForm />)

    await user.type(screen.getByLabelText(/animal tag number/i), 'A001')
    await user.type(screen.getByLabelText(/^weight/i), '52.3')

    const submitButton = screen.getByRole('button', { name: /record weight/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /recording/i })
    ).toBeInTheDocument()

    await waitFor(
      () => {
        expect(submitButton).not.toBeDisabled()
      },
      { timeout: 200 }
    )
  })

  it('should include notes when provided', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' })
    })

    render(<WeightRecordingForm />)

    await user.type(screen.getByLabelText(/animal tag number/i), 'A001')
    await user.type(screen.getByLabelText(/^weight/i), '52.3')
    await user.type(screen.getByLabelText(/notes/i), 'After shearing')

    await user.click(screen.getByRole('button', { name: /record weight/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/weights',
        expect.objectContaining({
          body: JSON.stringify({
            tagNumber: 'A001',
            weight: '52.3',
            notes: 'After shearing'
          })
        })
      )
    })
  })
})
