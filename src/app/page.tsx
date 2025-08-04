'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

import AnimalRegistrationForm from '@/components/forms/animal-registration-form'
import WeightRecordingForm from '@/components/forms/weight-recording-form'
import ThemeToggle from '@/components/ui/theme-toggle'

export default function Home() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'register' | 'weight'>('register')

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
            <div className='flex items-center'>
              <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Farm Animal Tracker
              </h1>
            </div>
            <div className='flex items-center space-x-4'>
              <ThemeToggle />
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Welcome, {session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className='bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors'
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Tab Navigation */}
        <div className='mb-6'>
          <div className='border-b border-gray-200 dark:border-gray-700'>
            <nav className='-mb-px flex space-x-8'>
              <button
                onClick={() => setActiveTab('register')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'register'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Register Animal
              </button>
              <button
                onClick={() => setActiveTab('weight')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'weight'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Record Weight
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className='bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors'>
          {activeTab === 'register' && (
            <div>
              <h2 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                Register New Animal
              </h2>
              <AnimalRegistrationForm />
            </div>
          )}

          {activeTab === 'weight' && (
            <div>
              <h2 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                Record Animal Weight
              </h2>
              <WeightRecordingForm />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
