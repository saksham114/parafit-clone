'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase-browser'
import AppBar from '@/components/ui/AppBar'
import BottomNav from '@/components/ui/BottomNav'
import PWAProvider from '@/components/PWAProvider'
import InstallBanner from '@/components/InstallBanner'
import { useAnalytics } from '@/hooks/useAnalytics'

// Dynamic import for OneSignalProvider to prevent SSR bundling
const OneSignalProvider = dynamic(() => import('@/components/OneSignalProvider'), { ssr: false })

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUserId, trackInteraction } = useAnalytics()
  const supabase = createClient()
  const pathname = usePathname()
  
  // Get OneSignal App ID from environment
  const oneSignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? undefined

  // Set user ID for analytics when available
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        
        // Track app initialization
        trackInteraction('init', 'app', { 
          userId: user.id,
          timestamp: new Date().toISOString()
        })
      }
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUserId(session.user.id)
          trackInteraction('auth', 'sign_in', { userId: session.user.id })
        } else if (event === 'SIGNED_OUT') {
          setUserId('')
          trackInteraction('auth', 'sign_out', {})
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, setUserId, trackInteraction])

  // Only show AppBar on dashboard
  const isDashboard = pathname === '/dashboard'

  return (
    <OneSignalProvider appId={oneSignalAppId}>
      <PWAProvider>
        <div className="min-h-screen bg-gray-50">
          {isDashboard && <AppBar title="Home" />}
          <main className="max-w-screen-sm mx-auto pb-28">
            {children}
          </main>
          <BottomNav />
          <InstallBanner />
        </div>
      </PWAProvider>
    </OneSignalProvider>
  )
}
