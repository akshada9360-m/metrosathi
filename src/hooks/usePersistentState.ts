import { useState } from 'react'

interface PersistentState<T> {
  value: T
  error: string
}

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T,
): [T, (value: T | ((current: T) => T)) => void, string] {
  const [stored, setStored] = useState<PersistentState<T>>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return { value: initialValue, error: '' }
      const parsed: unknown = JSON.parse(raw)
      if (!isValid(parsed)) {
        return { value: initialValue, error: 'Saved browser data has an unsupported format.' }
      }
      return { value: parsed, error: '' }
    } catch {
      return { value: initialValue, error: 'Could not read saved data from this browser.' }
    }
  })

  const update = (value: T | ((current: T) => T)) => {
    const nextValue = typeof value === 'function'
      ? (value as (current: T) => T)(stored.value)
      : value
    try {
      window.localStorage.setItem(key, JSON.stringify(nextValue))
      setStored({ value: nextValue, error: '' })
    } catch {
      setStored({
        value: nextValue,
        error: 'Could not save this preference in browser storage. Check available storage and privacy settings.',
      })
    }
  }

  return [stored.value, update, stored.error]
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}
