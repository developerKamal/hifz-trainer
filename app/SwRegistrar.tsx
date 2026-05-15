'use client'

import { useEffect } from 'react'

export default function SwRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {/* offline or blocked */})
    }
  }, [])

  return null
}
