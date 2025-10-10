'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

import AppHeader from '@/components/ui/app-header'

export default function Home() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Loading...</h1>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Register Animal',
      description: 'Add a new animal to your farm tracking system',
      href: '/animals/register',
      icon: (
        <svg
          className='w-8 h-8'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 4v16m8-8H4'
          />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Record Weight',
      description: 'Record the current weight of an animal',
      href: '/weights/record',
      icon: (
        <svg
          className='w-8 h-8'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
          />
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'View Animals',
      description: 'Browse and search all registered animals',
      href: '/animals',
      icon: (
        <svg
          className='w-8 h-8'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 6h16M4 10h16M4 14h16M4 18h16'
          />
        </svg>
      ),
      color: 'purple'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30',
      green:
        'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30',
      purple:
        'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30'
    }
    return colors[color as keyof typeof colors]
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors'>
      <AppHeader />

      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            Welcome back!
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage your farm animals and track their weight records
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className='group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            >
              <div
                className={`inline-flex p-3 rounded-lg mb-4 transition-colors ${getColorClasses(action.color)}`}
              >
                {action.icon}
              </div>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                {action.title}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 text-sm'>
                {action.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className='mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2'>
            Getting Started
          </h2>
          <p className='text-blue-800 dark:text-blue-400 text-sm'>
            Start by registering your animals, then record their weights
            regularly to track their growth and health. You can view detailed
            history and trends for each animal in the animals list.
          </p>
        </div>
      </main>
    </div>
  )
}
