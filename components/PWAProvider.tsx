'use client'

import { useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'

interface PWAProviderProps {
  children: React.ReactNode
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const { hasUpdate, updateApp } = usePWA()

  // Handle service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // New service worker has taken control
        window.location.reload()
      })
    }
  }, [])

  // Handle app updates
  useEffect(() => {
    if (hasUpdate) {
      // Show update notification
      console.log('New version available')
    }
  }, [hasUpdate])

  return <>{children}</>
}
