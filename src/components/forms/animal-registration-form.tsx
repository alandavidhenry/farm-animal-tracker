'use client'

import { useState } from 'react'

type AnimalTypeValue = 'SHEEP' | 'LAMB' | 'GOAT' | 'CATTLE' | 'PIG'

interface AnimalFormData {
  tagNumber: string
  type: AnimalTypeValue
  initialWeight: string
  birthDate: string
  notes: string
}

export default function AnimalRegistrationForm() {
  const [formData, setFormData] = useState<AnimalFormData>({
    tagNumber: '',
    type: 'SHEEP',
    initialWeight: '',
    birthDate: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/animals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tagNumber: formData.tagNumber,
          type: formData.type,
          initialWeight: formData.initialWeight,
          birthDate: formData.birthDate || null,
          notes: formData.notes || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register animal')
      }

      setMessage({
        type: 'success',
        text: `Animal ${formData.tagNumber} registered successfully!`
      })

      // Reset form
      setFormData({
        tagNumber: '',
        type: 'SHEEP',
        initialWeight: '',
        birthDate: '',
        notes: ''
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to register animal. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Tag Number */}
        <div>
          <label
            htmlFor='tagNumber'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
          >
            Tag Number *
          </label>
          <input
            type='text'
            id='tagNumber'
            name='tagNumber'
            value={formData.tagNumber}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'
            placeholder='e.g., A001, B123'
          />
        </div>

        {/* Animal Type */}
        <div>
          <label
            htmlFor='type'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
          >
            Animal Type *
          </label>
          <select
            id='type'
            name='type'
            value={formData.type}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'
          >
            <option value='SHEEP'>Sheep</option>
            <option value='LAMB'>Lamb</option>
            <option value='GOAT'>Goat</option>
            <option value='CATTLE'>Cattle</option>
            <option value='PIG'>Pig</option>
          </select>
        </div>

        {/* Initial Weight */}
        <div>
          <label
            htmlFor='initialWeight'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
          >
            Initial Weight (kg) *
          </label>
          <input
            type='number'
            id='initialWeight'
            name='initialWeight'
            value={formData.initialWeight}
            onChange={handleChange}
            required
            min='0'
            step='0.1'
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'
            placeholder='e.g., 45.5'
          />
        </div>

        {/* Birth Date */}
        <div>
          <label
            htmlFor='birthDate'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
          >
            Birth Date (optional)
          </label>
          <input
            type='date'
            id='birthDate'
            name='birthDate'
            value={formData.birthDate}
            onChange={handleChange}
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor='notes'
          className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
        >
          Notes (optional)
        </label>
        <textarea
          id='notes'
          name='notes'
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'
          placeholder='Any additional notes about the animal...'
        />
      </div>

      {/* Submit Button */}
      <div className='flex justify-end'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-blue-300 dark:disabled:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800'
        >
          {isSubmitting ? 'Registering...' : 'Register Animal'}
        </button>
      </div>
    </form>
  )
}
