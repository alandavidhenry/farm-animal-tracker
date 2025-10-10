import { Geist, Geist_Mono } from 'next/font/google'

import AuthSessionProvider from '@/components/auth/session-provider'
import { ThemeProvider } from '@/contexts/theme-context'
import './globals.css'

import type { Metadata } from 'next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Farm Animal Tracker',
  description: 'Track farm animal weights and data',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
