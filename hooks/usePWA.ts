import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  hasUpdate: boolean
  isOnline: boolean
  deferredPrompt: BeforeInstallPromptEvent | null
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    hasUpdate: false,
    isOnline: navigator.onLine,
    deferredPrompt: null
  })

  // Check if app is installed
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true
      
      setState(prev => ({ ...prev, isInstalled }))
    }

    checkInstallation()
    window.addEventListener('appinstalled', checkInstallation)
    
    return () => {
      window.removeEventListener('appinstalled', checkInstallation)
    }
  }, [])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const deferredPrompt = e as BeforeInstallPromptEvent
      
      setState(prev => ({ 
        ...prev, 
        canInstall: true, 
        deferredPrompt 
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Service worker registration and update handling
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, hasUpdate: true }))
                }
              })
            }
          })

          // Handle controller change (new version activated)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            setState(prev => ({ ...prev, hasUpdate: false }))
            window.location.reload()
          })

        } catch (error) {
          console.error('Service worker registration failed:', error)
        }
      }

      registerSW()
    }
  }, [])

  // Install app
  const installApp = useCallback(async () => {
    if (state.deferredPrompt) {
      try {
        await state.deferredPrompt.prompt()
        const { outcome } = await state.deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
          setState(prev => ({ 
            ...prev, 
            canInstall: false, 
            deferredPrompt: null 
          }))
        }
      } catch (error) {
        console.error('Installation failed:', error)
      }
    }
  }, [state.deferredPrompt])

  // Update app
  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
    }
  }, [])

  // Reload app
  const reloadApp = useCallback(() => {
    window.location.reload()
  }, [])

  return {
    ...state,
    installApp,
    updateApp,
    reloadApp
  }
}
