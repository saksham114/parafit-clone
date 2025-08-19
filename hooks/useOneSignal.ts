'use client'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    OneSignal: any
  }
}

export type UseOneSignalReturn = {
  isInitialized: boolean
  isSubscribed: boolean
  permission: NotificationPermission
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

export function useOneSignal(appId?: string): UseOneSignalReturn {
  // Always call hooks (no early returns)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    let cancelled = false

    // Only run on client
    if (typeof window === 'undefined') return

    // If no appId, just reflect current permission state and no-init
    if (!appId) {
      setIsInitialized(false)
      setIsSubscribed(false)
      setPermission(typeof Notification !== 'undefined' ? Notification.permission : 'default')
      return
    }

    // Move ensureSdk function inside useEffect to prevent module scope access
    const ensureSdk = (): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve()
        // If already present, resolve
        if (window.OneSignal) return resolve()
        // If a script is already pending/loaded, still set window.OneSignal array
        const existing = document.getElementById('onesignal-sdk')
        if (existing) {
          window.OneSignal = window.OneSignal || []
          return resolve()
        }
        // Inject SDK
        const s = document.createElement('script')
        s.id = 'onesignal-sdk'
        s.async = true
        s.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.page.js'
        s.onload = () => {
          window.OneSignal = window.OneSignal || []
          resolve()
        }
        document.head.appendChild(s)
      })
    }

    ;(async () => {
      await ensureSdk()
      if (cancelled) return
      const OneSignal = window.OneSignal

      // Initialize SDK (v16-compatible init)
      OneSignal.push(async () => {
        try {
          await OneSignal.init({
            appId,
            allowLocalhostAsSecureOrigin: true, // for http://localhost
          })
          if (cancelled) return
          setIsInitialized(true)

          // Try to read current state
          try {
            const sub = await OneSignal.User.PushSubscription.optedIn
            setIsSubscribed(!!sub)
          } catch {
            setIsSubscribed(false)
          }
          setPermission(typeof Notification !== 'undefined' ? Notification.permission : 'default')

          // Listen for subscription & permission changes (best-effort)
          try {
            OneSignal.User.PushSubscription.addEventListener('change', (state: any) => {
              if (!cancelled) setIsSubscribed(!!state.current?.optedIn)
            })
          } catch {}
          try {
            OneSignal.Notifications.addEventListener('permissionChange', (evt: any) => {
              if (!cancelled) setPermission(evt?.to ?? (typeof Notification !== 'undefined' ? Notification.permission : 'default'))
            })
          } catch {}
        } catch {
          if (!cancelled) {
            setIsInitialized(false)
            setIsSubscribed(false)
          }
        }
      })
    })()

    return () => {
      cancelled = true
    }
  }, [appId])

  const subscribe = async () => {
    if (typeof window === 'undefined' || !window.OneSignal) return
    try {
      await window.OneSignal.Slidedown.promptPush()
    } catch {}
  }

  const unsubscribe = async () => {
    if (typeof window === 'undefined' || !window.OneSignal) return
    try {
      await window.OneSignal.User.PushSubscription.optOut()
    } catch {}
  }

  return { isInitialized, isSubscribed, permission, subscribe, unsubscribe }
}
