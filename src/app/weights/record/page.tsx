'use client'

import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Suspense } from 'react'

import WeightRecordingForm from '@/components/forms/weight-recording-form'
import AppHeader from '@/components/ui/app-header'

function RecordWeightContent() {
  const searchParams = useSearchParams()
  const tagNumber = searchParams.get('tagNumber')
  const returnUrl = searchParams.get('returnUrl')

  return (
    <main className='max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
      <div className='bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors'>
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            Record Animal Weight
            {tagNumber && (
              <span className='text-blue-600 dark:text-blue-400'>
                {' '}
                - {tagNumber}
              </span>
            )}
          </h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Record the current weight of an animal. The date and time will be
            automatically captured.
          </p>
        </div>
        <WeightRecordingForm
          prefilledTagNumber={tagNumber || undefined}
          readonly={!!tagNumber}
          returnUrl={returnUrl || undefined}
        />
      </div>
    </main>
  )
}

export default function RecordWeightPage() {
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

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors'>
      <AppHeader />
      <Suspense
        fallback={
          <main className='max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
            <div className='bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors'>
              <div className='text-center py-12'>
                <div className='text-gray-500 dark:text-gray-400'>
                  Loading...
                </div>
              </div>
            </div>
          </main>
        }
      >
        <RecordWeightContent />
      </Suspense>
    </div>
  )
}
