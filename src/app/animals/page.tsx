'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

import ThemeToggle from '@/components/ui/theme-toggle'

interface Animal {
  id: number
  tagNumber: string
  type: string
  birthDate: string | null
  createdAt: string
  weights: {
    weight: number
    recordedAt: string
  }[]
}

export default function AnimalsPage() {
  const { data: session } = useSession()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchAnimals()
    }
  }, [session])

  const fetchAnimals = async (query?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const url = query
        ? `/api/animals?tagNumber=${encodeURIComponent(query)}`
        : '/api/animals'
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch animals')
      }

      const data = await response.json()
      setAnimals(data.animals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load animals')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAnimals(searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    fetchAnimals()
  }

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
      {/* Header */}
      <header className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/'
                className='text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
              >
                Farm Animal Tracker
              </Link>
              <span className='text-gray-400 dark:text-gray-600'>|</span>
              <h1 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
                Animals
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Search Bar */}
        <div className='mb-6'>
          <form onSubmit={handleSearch} className='flex gap-2'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by tag number...'
              className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'
            />
            <button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900'
            >
              Search
            </button>
            {searchQuery && (
              <button
                type='button'
                onClick={handleClearSearch}
                className='bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900'
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'>
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className='text-center py-12'>
            <div className='text-gray-500 dark:text-gray-400'>
              Loading animals...
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && animals.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-gray-500 dark:text-gray-400'>
              {searchQuery
                ? 'No animals found matching your search.'
                : 'No animals registered yet.'}
            </div>
            <Link
              href='/'
              className='mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline'
            >
              Register your first animal
            </Link>
          </div>
        )}

        {/* Animals List */}
        {!isLoading && animals.length > 0 && (
          <div className='bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Tag Number
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Type
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Birth Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Latest Weight
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Registered
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                  {animals.map((animal) => (
                    <tr
                      key={animal.id}
                      className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                        {animal.tagNumber}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {animal.type}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {animal.birthDate
                          ? new Date(animal.birthDate).toLocaleDateString(
                              'en-GB'
                            )
                          : '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {animal.weights[0]
                          ? `${animal.weights[0].weight} kg`
                          : '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {new Date(animal.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <Link
                          href={`/animals/${animal.id}`}
                          className='text-blue-600 dark:text-blue-400 hover:underline'
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
