'use client'

import { useState } from 'react'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import { Bell, Settings, X } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function OneSignalBanner() {
  const [isDismissed, setIsDismissed] = useState(false)
  const { trackInteraction } = useAnalytics()

  if (isDismissed) {
    return null
  }

  const handleTryAgain = () => {
    trackInteraction('retry', 'notification_permission', { action: 'try_again' })
    // Request notification permission again
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }

  const handleOpenSettings = () => {
    trackInteraction('open', 'browser_settings', { action: 'notification_permission' })
    // Open browser settings (this will vary by browser)
    if (navigator.userAgent.includes('Chrome')) {
      window.open('chrome://settings/content/notifications', '_blank')
    } else if (navigator.userAgent.includes('Firefox')) {
      window.open('about:preferences#privacy', '_blank')
    } else if (navigator.userAgent.includes('Safari')) {
      window.open('x-apple.systempreferences:com.apple.preference.notifications', '_blank')
    } else {
      // Generic fallback
      alert('Please enable notifications in your browser settings to receive reminders.')
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    trackInteraction('dismiss', 'notification_banner', { reason: 'permission_denied' })
  }

  return (
    <Card variant="glass" className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="w-5 h-5 mr-3" />
          <div>
            <h3 className="font-semibold">Enable Notifications</h3>
            <p className="text-sm text-orange-100">Get meal and water reminders</p>
          </div>
        </div>
        <div className="flex gap-2">
          <CTAButton 
            onClick={handleTryAgain}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Try Again
          </CTAButton>
          <CTAButton 
            onClick={handleOpenSettings}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </CTAButton>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}

