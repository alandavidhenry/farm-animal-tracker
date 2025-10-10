'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

import AppHeader from '@/components/ui/app-header'

interface WeightRecord {
  id: number
  weight: number
  recordedAt: string
  notes: string | null
}

interface Animal {
  id: number
  tagNumber: string
  type: string
  birthDate: string | null
  createdAt: string
  weights: WeightRecord[]
}

export default function AnimalDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnimalDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch animal data
        const animalsResponse = await fetch('/api/animals')
        if (!animalsResponse.ok) {
          throw new Error('Failed to fetch animal data')
        }

        const animalsData = await animalsResponse.json()
        const foundAnimal = animalsData.animals.find(
          (a: Animal) => a.id === parseInt(params.id as string)
        )

        if (!foundAnimal) {
          throw new Error('Animal not found')
        }

        // Fetch weight history for this animal
        const weightsResponse = await fetch(
          `/api/weights?animalId=${params.id}`
        )
        if (!weightsResponse.ok) {
          throw new Error('Failed to fetch weight history')
        }

        const weightsData = await weightsResponse.json()

        setAnimal({
          ...foundAnimal,
          weights: weightsData.weights
        })
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load animal details'
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (session && params.id) {
      fetchAnimalDetails()
    }
  }, [session, params.id])

  if (!session) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors'>
      <AppHeader />

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'>
            {error}
            <div className='mt-2'>
              <Link
                href='/animals'
                className='text-blue-600 dark:text-blue-400 hover:underline'
              >
                Back to Animals List
              </Link>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className='text-center py-12'>
            <div className='text-gray-500 dark:text-gray-400'>
              Loading animal details...
            </div>
          </div>
        )}

        {/* Animal Details */}
        {!isLoading && animal && (
          <div className='space-y-6'>
            {/* Animal Info Card */}
            <div className='bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                Animal Information
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div>
                  <span className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Tag Number
                  </span>
                  <span className='block text-lg text-gray-900 dark:text-white'>
                    {animal.tagNumber}
                  </span>
                </div>
                <div>
                  <span className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Type
                  </span>
                  <span className='block text-lg text-gray-900 dark:text-white'>
                    {animal.type}
                  </span>
                </div>
                <div>
                  <span className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Birth Date
                  </span>
                  <span className='block text-lg text-gray-900 dark:text-white'>
                    {animal.birthDate
                      ? new Date(animal.birthDate).toLocaleDateString('en-GB')
                      : 'Not recorded'}
                  </span>
                </div>
                <div>
                  <span className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Registered
                  </span>
                  <span className='block text-lg text-gray-900 dark:text-white'>
                    {new Date(animal.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div>
                  <span className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Current Weight
                  </span>
                  <span className='block text-lg text-gray-900 dark:text-white'>
                    {animal.weights[0]
                      ? `${animal.weights[0].weight} kg`
                      : 'No records'}
                  </span>
                </div>
                <div>
                  <span className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Total Records
                  </span>
                  <span className='block text-lg text-gray-900 dark:text-white'>
                    {animal.weights.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Weight History */}
            <div className='bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                Weight History
              </h2>

              {animal.weights.length === 0 ? (
                <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                  No weight records found for this animal.
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                    <thead className='bg-gray-50 dark:bg-gray-700'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Date & Time
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Weight (kg)
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Change
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                      {animal.weights.map((record, index) => {
                        const previousWeight =
                          index < animal.weights.length - 1
                            ? animal.weights[index + 1].weight
                            : null
                        const change = previousWeight
                          ? record.weight - previousWeight
                          : null

                        return (
                          <tr
                            key={record.id}
                            className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                          >
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                              {new Date(record.recordedAt).toLocaleString(
                                'en-GB',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }
                              )}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                              {record.weight} kg
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm'>
                              {change !== null ? (
                                <span
                                  className={(() => {
                                    if (change > 0) {
                                      return 'text-green-600 dark:text-green-400'
                                    }
                                    if (change < 0) {
                                      return 'text-red-600 dark:text-red-400'
                                    }
                                    return 'text-gray-500 dark:text-gray-400'
                                  })()}
                                >
                                  {change > 0 ? '+' : ''}
                                  {change.toFixed(1)} kg
                                </span>
                              ) : (
                                <span className='text-gray-500 dark:text-gray-400'>
                                  -
                                </span>
                              )}
                            </td>
                            <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                              {record.notes || '-'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className='flex gap-4'>
              <Link
                href='/animals'
                className='bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900'
              >
                Back to Animals
              </Link>
              <Link
                href='/weights/record'
                className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900'
              >
                Record New Weight
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
