import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export function useOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Set up presence channel for online status
    const channel = supabase.channel(`presence:${userId}`)
    
    // Set user as online
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        const isUserOnline = Object.keys(presenceState).length > 0
        setIsOnline(isUserOnline)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setIsOnline(true)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setIsOnline(false)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence
          await channel.track({ user_id: userId, online_at: new Date().toISOString() })
        }
      })

    return () => {
      // Clean up presence tracking
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return isOnline
}
