'use client'
import { useState } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { useAnalytics } from '@/hooks/useAnalytics'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import { Download, X, Smartphone } from 'lucide-react'

export default function InstallBanner() {
  const { canInstall, isInstalled, hasUpdate, updateApp, reloadApp } = usePWA()
  const [isDismissed, setIsDismissed] = useState(false)
  const { trackInteraction } = useAnalytics()

  if (isInstalled || isDismissed || (!canInstall && !hasUpdate)) {
    return null
  }

  const handleInstall = () => {
    trackInteraction('install', 'pwa', { canInstall, hasUpdate })
  }

  const handleUpdate = () => {
    trackInteraction('update', 'pwa', { hasUpdate })
    updateApp()
  }

  const handleReload = () => {
    trackInteraction('reload', 'pwa', { hasUpdate })
    reloadApp()
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    trackInteraction('dismiss', 'pwa_banner', { type: hasUpdate ? 'update' : 'install' })
  }

  if (hasUpdate) {
    return (
      <Card variant="glass" className="fixed bottom-24 left-4 right-4 z-50 bg-gradient-to-r from-teal-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Smartphone className="w-5 h-5 mr-3" />
            <div>
              <h3 className="font-semibold">New version available!</h3>
              <p className="text-sm text-teal-100">Update to get the latest features</p>
            </div>
          </div>
          <div className="flex gap-2">
            <CTAButton 
              onClick={handleUpdate}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Update
            </CTAButton>
            <CTAButton 
              onClick={handleReload}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Reload
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

  return (
    <Card variant="glass" className="fixed bottom-24 left-4 right-4 z-50 bg-gradient-to-r from-teal-500 to-blue-600 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Download className="w-5 h-5 mr-3" />
          <div>
            <h3 className="font-semibold">Install Parafit</h3>
            <p className="text-sm text-teal-100">Add to home screen for quick access</p>
          </div>
        </div>
        <div className="flex gap-2">
          <CTAButton 
            onClick={handleInstall}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Install
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
