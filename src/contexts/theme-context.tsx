'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') as Theme
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches

    if (savedTheme) {
      setTheme(savedTheme)
    } else if (prefersDark) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Apply theme to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    if (theme === 'dark') {
      root.style.colorScheme = 'dark'
    } else {
      root.style.colorScheme = 'light'
    }

    // Save theme preference
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme])
  const fallbackValue = useMemo(
    () => ({ theme: 'light' as Theme, toggleTheme: () => {} }),
    []
  )

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <ThemeContext.Provider value={fallbackValue}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
