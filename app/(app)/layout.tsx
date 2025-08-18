'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import TopBar from '@/components/TopBar'
import BottomTabs from '@/components/BottomTabs'
import OneSignalProvider from '@/components/OneSignalProvider'
import PWAProvider from '@/components/PWAProvider'
import InstallBanner from '@/components/InstallBanner'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function AppLayout({
  children,
  oneSignalAppId,
}: {
  children: React.ReactNode
  oneSignalAppId: string
}) {
  const { setUserId, trackInteraction } = useAnalytics()
  const supabase = createClient()

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

  return (
    <OneSignalProvider appId={oneSignalAppId}>
      <PWAProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <TopBar title="Parafit Clone" />
          <main className="flex-1 px-4 py-6">
            {children}
          </main>
          <BottomTabs />
          <InstallBanner />
        </div>
      </PWAProvider>
    </OneSignalProvider>
  )
}
