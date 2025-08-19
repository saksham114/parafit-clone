'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import SegmentedControl from '@/components/SegmentedControl'
import Chip from '@/components/Chip'
import Toast from '@/components/Toast'
import { useAnalytics } from '@/hooks/useAnalytics'

interface ProfileForm {
  full_name: string
  city: string
  goal: 'lose' | 'maintain' | 'gain'
  dietary_prefs: string[]
  allergies: string[]
  avatar_url: string
}

export default function SettingsPage() {
  const [form, setForm] = useState<ProfileForm>({
    full_name: '',
    city: '',
    goal: 'maintain',
    dietary_prefs: [],
    allergies: [],
    avatar_url: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [allergyInput, setAllergyInput] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  
  const { trackOnboardingComplete, trackInteraction } = useAnalytics()

  const goalOptions = [
    { value: 'lose', label: 'Lose Weight' },
    { value: 'maintain', label: 'Maintain' },
    { value: 'gain', label: 'Gain Weight' }
  ]

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Mediterranean'
  ]

  // Load current profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const data = await response.json()
        if (data.ok && data.data) {
          setForm(prev => ({
            ...prev,
            ...data.data
          }))
          
          // Check if this is first time completing profile
          if (data.data.full_name && !hasCompletedOnboarding) {
            setHasCompletedOnboarding(true)
            const onboardingSteps = ['profile_creation']
            if (data.data.goal) onboardingSteps.push('goal_setting')
            if (data.data.dietary_prefs?.length) onboardingSteps.push('dietary_preferences')
            if (data.data.allergies?.length) onboardingSteps.push('allergies_setting')
            
            trackOnboardingComplete(onboardingSteps)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const saveProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          setToastMessage('Profile updated successfully!')
          setToastType('success')
          setShowToast(true)
          
          // Track profile update
          trackInteraction('update', 'profile', {
            hasName: !!form.full_name,
            hasGoal: !!form.goal,
            hasDietaryPrefs: form.dietary_prefs.length > 0,
            hasAllergies: form.allergies.length > 0
          })
          
          // Check if onboarding was just completed
          if (!hasCompletedOnboarding && form.full_name) {
            setHasCompletedOnboarding(true)
            const onboardingSteps = ['profile_creation']
            if (form.goal) onboardingSteps.push('goal_setting')
            if (form.dietary_prefs?.length) onboardingSteps.push('dietary_preferences')
            if (form.allergies?.length) onboardingSteps.push('allergies_setting')
            
            trackOnboardingComplete(onboardingSteps)
          }
        } else {
          throw new Error(data.error || 'Failed to update profile')
        }
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Failed to update profile')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsLoading(false)
    }
  }

  const addDietaryPref = (pref: string) => {
    if (!form.dietary_prefs.includes(pref)) {
      setForm(prev => ({
        ...prev,
        dietary_prefs: [...prev.dietary_prefs, pref]
      }))
    }
  }

  const removeDietaryPref = (pref: string) => {
    setForm(prev => ({
      ...prev,
      dietary_prefs: prev.dietary_prefs.filter(p => p !== pref)
    }))
  }

  const addAllergy = () => {
    if (allergyInput.trim() && !form.allergies.includes(allergyInput.trim())) {
      setForm(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }))
      setAllergyInput('')
    }
  }

  const removeAllergy = (allergy: string) => {
    setForm(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addAllergy()
    }
  }

  const checkAdminRole = async () => {
    try {
      const response = await fetch('/api/admin/check')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.ok && data.data?.role === 'admin')
      }
    } catch (error) {
      console.error('Failed to check admin role:', error)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <Card variant="glass" className="text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Profile Settings</h2>
        <p className="text-text-secondary">Customize your fitness journey</p>
      </Card>

      {/* Profile Form */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Personal Information</h3>
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 bg-card/60 border border-card/40 rounded-xl text-text-primary placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Enter your city"
              className="w-full px-3 py-2 bg-card/60 border border-card/40 rounded-xl text-text-primary placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Avatar URL</label>
            <input
              type="url"
              value={form.avatar_url}
              onChange={(e) => setForm(prev => ({ ...prev, avatar_url: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 bg-card/60 border border-card/40 rounded-xl text-text-primary placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Fitness Goal */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Fitness Goal</h3>
        <SegmentedControl
          options={goalOptions}
          value={form.goal}
          onChange={(value) => setForm(prev => ({ ...prev, goal: value as 'lose' | 'maintain' | 'gain' }))}
        />
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Dietary Preferences</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((pref) => (
              <button
                key={pref}
                onClick={() => addDietaryPref(pref)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form.dietary_prefs.includes(pref)
                    ? 'bg-primary text-surface'
                    : 'bg-card/40 text-text-secondary hover:bg-card/60'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
          
          {form.dietary_prefs.length > 0 && (
            <div>
              <p className="text-sm text-text-secondary mb-2">Selected preferences:</p>
              <div className="flex flex-wrap gap-2">
                {form.dietary_prefs.map((pref) => (
                  <Chip
                    key={pref}
                    label={pref}
                    variant="removable"
                    onRemove={() => removeDietaryPref(pref)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Allergies */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Food Allergies</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add an allergy (e.g., peanuts)"
              className="flex-1 px-3 py-2 bg-card/60 border border-card/40 rounded-xl text-text-primary placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <CTAButton size="sm" onClick={addAllergy}>
              Add
            </CTAButton>
          </div>
          
          {form.allergies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.allergies.map((allergy) => (
                <Chip
                  key={allergy}
                  label={allergy}
                  variant="removable"
                  onRemove={() => removeAllergy(allergy)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Reminders Link */}
      <Card>
        <Link href="/settings/reminders">
          <div className="flex items-center justify-between p-3 hover:bg-card/40 rounded-xl transition-colors cursor-pointer">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔔</span>
              <div>
                <p className="font-medium text-text-primary">Notification Reminders</p>
                <p className="text-sm text-text-secondary">Set meal and water reminders</p>
              </div>
            </div>
            <span className="text-text-secondary">→</span>
          </div>
        </Link>
      </Card>

      {/* Environment Check Link */}
      <Card>
        <Link href="/env-check">
          <div className="flex items-center justify-between p-3 hover:bg-card/40 rounded-xl transition-colors cursor-pointer">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚙️</span>
              <div>
                <p className="font-medium text-text-primary">Environment Check</p>
                <p className="text-sm text-text-secondary">Verify environment variables</p>
              </div>
            </div>
            <span className="text-text-secondary">→</span>
          </div>
        </Link>
      </Card>

      {/* Admin Support Link - Only show for admin users */}
      {isAdmin && (
        <Card>
          <Link href="/admin/support">
            <div className="flex items-center justify-between p-3 hover:bg-card/40 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🛠️</span>
                <div>
                  <p className="font-medium text-text-primary">Admin Support</p>
                  <p className="text-sm text-text-secondary">Manage user support conversations</p>
                </div>
              </div>
              <span className="text-text-secondary">→</span>
            </div>
          </Link>
        </Card>
      )}

      {/* Admin Recipes Link - Only show for admin users */}
      {isAdmin && (
        <Card>
          <Link href="/admin/recipes">
            <div className="flex items-center justify-between p-3 hover:bg-card/40 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🍽️</span>
                <div>
                  <p className="font-medium text-text-primary">Admin Recipes</p>
                  <p className="text-sm text-text-secondary">Create and manage recipe content</p>
                </div>
              </div>
              <span className="text-text-secondary">→</span>
            </div>
          </Link>
        </Card>
      )}

      {/* Admin Plans Link - Only show for admin users */}
      {isAdmin && (
        <Card>
          <Link href="/admin/plans">
            <div className="flex items-center justify-between p-3 hover:bg-card/40 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📅</span>
                <div>
                  <p className="font-medium text-text-primary">Admin Plans</p>
                  <p className="text-sm text-text-secondary">Create and manage meal plans</p>
                </div>
              </div>
              <span className="text-text-secondary">→</span>
            </div>
          </Link>
        </Card>
      )}

      {/* Save Button */}
      <Card>
        <CTAButton 
          onClick={saveProfile} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </CTAButton>
      </Card>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
