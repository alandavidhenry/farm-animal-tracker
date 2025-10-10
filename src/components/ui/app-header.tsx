'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

import ThemeToggle from './theme-toggle'

export default function AppHeader() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Register Animal', href: '/animals/register' },
    { name: 'Record Weight', href: '/weights/record' },
    { name: 'View Animals', href: '/animals' }
  ]

  return (
    <header className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Title */}
          <div className='flex items-center space-x-4'>
            <Link
              href='/'
              className='text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
            >
              Farm Animal Tracker
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-4'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                {item.name}
              </Link>
            ))}
            <ThemeToggle />
            {session && (
              <>
                <span className='text-sm text-gray-500 dark:text-gray-400 hidden lg:inline'>
                  {session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className='bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className='flex items-center space-x-2 md:hidden'>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
              aria-expanded={mobileMenuOpen}
              aria-label='Toggle menu'
            >
              <span className='sr-only'>Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              ) : (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='md:hidden border-t border-gray-200 dark:border-gray-700'>
          <div className='px-2 pt-2 pb-3 space-y-1'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {session && (
              <div className='pt-4 pb-3 border-t border-gray-200 dark:border-gray-700'>
                <div className='px-3 pb-2 text-sm text-gray-500 dark:text-gray-400'>
                  {session.user?.email}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut()
                  }}
                  className='w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
