'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [hydrated, setHydrated] = useState(false)
  const [value, setValue] = useState<T>(initialValue)

  // Read from localStorage after first mount (after SSR hydration completes)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setValue(JSON.parse(stored) as T)
    } catch {
      // corrupt storage — ignore
    }
    setHydrated(true)
  }, [key])

  // Only write once hydrated — prevents overwriting localStorage with initialValue on mount
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // quota exceeded — ignore
    }
  }, [key, value, hydrated])

  return [value, setValue] as const
}
