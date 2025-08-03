'use client'

import { useState } from 'react'

type AnimalType = 'SHEEP' | 'LAMB' | 'GOAT' | 'CATTLE' | 'PIG'

interface AnimalFormData {
  tagNumber: string
  type: AnimalType
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      // TODO: Replace with actual API call when backend is implemented
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
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
        text: 'Failed to register animal. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Tag Number */}
        <div>
          <label htmlFor='tagNumber' className='block text-sm font-medium text-gray-700 mb-2'>
            Tag Number *
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
        </div>

        {/* Animal Type */}
        <div>
          <label htmlFor='type' className='block text-sm font-medium text-gray-700 mb-2'>
            Animal Type *
          </label>
          <select
            id='type'
            name='type'
            value={formData.type}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
          <label htmlFor='initialWeight' className='block text-sm font-medium text-gray-700 mb-2'>
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
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='e.g., 45.5'
          />
        </div>

        {/* Birth Date */}
        <div>
          <label htmlFor='birthDate' className='block text-sm font-medium text-gray-700 mb-2'>
            Birth Date (optional)
          </label>
          <input
            type='date'
            id='birthDate'
            name='birthDate'
            value={formData.birthDate}
            onChange={handleChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor='notes' className='block text-sm font-medium text-gray-700 mb-2'>
          Notes (optional)
        </label>
        <textarea
          id='notes'
          name='notes'
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='Any additional notes about the animal...'
        />
      </div>

      {/* Submit Button */}
      <div className='flex justify-end'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        >
          {isSubmitting ? 'Registering...' : 'Register Animal'}
        </button>
      </div>
    </form>
  )
}