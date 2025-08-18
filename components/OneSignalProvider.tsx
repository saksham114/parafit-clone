'use client'
import { ReactNode } from 'react'
import { useOneSignal } from '@/hooks/useOneSignal'

export default function OneSignalProvider({
  appId,
  children,
}: {
  appId?: string
  children: ReactNode
}) {
  // Always call the hook; it no-ops if appId is missing or during SSR
  useOneSignal(appId)
  return <>{children}</>
}
