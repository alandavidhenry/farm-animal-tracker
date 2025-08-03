'use client'

import { useState } from 'react'

interface WeightFormData {
  tagNumber: string
  weight: string
  notes: string
}

export default function WeightRecordingForm() {
  const [formData, setFormData] = useState<WeightFormData>({
    tagNumber: '',
    weight: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  const currentTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tagNumber: formData.tagNumber,
          weight: formData.weight,
          notes: formData.notes || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record weight')
      }

      setMessage({
        type: 'success',
        text: `Weight recorded for animal ${formData.tagNumber}: ${formData.weight}kg`
      })

      // Reset form
      setFormData({
        tagNumber: '',
        weight: '',
        notes: ''
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to record weight. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Date and Time Display */}
      <div className='bg-gray-50 p-4 rounded-md border'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='font-medium text-gray-700'>Recording Date:</span>
            <div className='text-gray-900'>{currentDate}</div>
          </div>
          <div>
            <span className='font-medium text-gray-700'>Recording Time:</span>
            <div className='text-gray-900'>{currentTime}</div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Tag Number */}
        <div>
          <label
            htmlFor='tagNumber'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Animal Tag Number *
          </label>
          <input
            type='text'
            id='tagNumber'
            name='tagNumber'
            value={formData.tagNumber}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='e.g., A001, B123'
          />
          <p className='mt-1 text-xs text-gray-500'>
            Enter the tag number of the animal to record weight for
          </p>
        </div>

        {/* Weight */}
        <div>
          <label
            htmlFor='weight'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Weight (kg) *
          </label>
          <input
            type='number'
            id='weight'
            name='weight'
            value={formData.weight}
            onChange={handleChange}
            required
            min='0'
            step='0.1'
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='e.g., 52.3'
          />
          <p className='mt-1 text-xs text-gray-500'>
            Current weight in kilograms
          </p>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor='notes'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Notes (optional)
        </label>
        <textarea
          id='notes'
          name='notes'
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='Any observations about the animal, health notes, etc...'
        />
      </div>

      {/* Submit Button */}
      <div className='flex justify-end'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
        >
          {isSubmitting ? 'Recording...' : 'Record Weight'}
        </button>
      </div>
    </form>
  )
}
