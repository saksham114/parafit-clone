'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

interface TopBarProps {
  title: string
  showUser?: boolean
}

interface UserProfile {
  full_name?: string
  avatar_url?: string
}

export default function TopBar({ title, showUser = true }: TopBarProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  
  useEffect(() => {
    if (showUser) {
      loadProfile()
    }
  }, [showUser])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const data = await response.json()
        if (data.ok && data.data) {
          setProfile(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }
  
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <nav className="bg-surface/80 backdrop-blur-sm border-b border-card/20 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
        
        {showUser && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-surface">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              {profile?.full_name && (
                <span className="text-sm font-medium text-text-primary hidden sm:block">
                  {profile.full_name}
                </span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
