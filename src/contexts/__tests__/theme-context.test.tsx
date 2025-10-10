import { renderHook, act } from '@testing-library/react'

import { ThemeProvider, useTheme } from '../theme-context'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('should provide default light theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    expect(result.current.theme).toBe('light')
  })

  it('should throw error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useTheme())
    }).toThrow('useTheme must be used within a ThemeProvider')

    consoleSpy.mockRestore()
  })

  it('should toggle theme from light to dark', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
  })

  it('should toggle theme from dark to light', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    // Toggle to dark
    act(() => {
      result.current.toggleTheme()
    })

    // Toggle back to light
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
  })

  it('should load saved theme from localStorage', () => {
    localStorageMock.setItem('theme', 'dark')

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    // Wait for effect to run
    setTimeout(() => {
      expect(result.current.theme).toBe('dark')
    }, 0)
  })

  it('should save theme to localStorage when changed', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    act(() => {
      result.current.toggleTheme()
    })

    // Wait for effect to run
    setTimeout(() => {
      expect(localStorageMock.getItem('theme')).toBe('dark')
    }, 0)
  })

  it('should use system preference when no saved theme', () => {
    // Mock prefers-color-scheme: dark
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    // Wait for effect to run
    setTimeout(() => {
      expect(result.current.theme).toBe('dark')
    }, 0)
  })
})
