'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const supabase = createClient()
  const { trackSignIn, trackError } = useAnalytics()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setMessageType('error')
        trackError('sign_in_failed', error.message)
      } else if (data.user) {
        setMessage('Signed in successfully!')
        setMessageType('success')
        
        // Track successful sign in
        trackSignIn('email_password', data.user.id)
        
        // Redirect to dashboard
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
      setMessageType('error')
      trackError('sign_in_exception', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage(error.message)
        setMessageType('error')
        trackError('google_sign_in_failed', error.message)
      } else {
        setMessage('Redirecting to Google...')
        setMessageType('success')
        
        // Track Google sign in attempt
        trackSignIn('google_oauth', undefined)
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
      setMessageType('error')
      trackError('google_sign_in_exception', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }
}
