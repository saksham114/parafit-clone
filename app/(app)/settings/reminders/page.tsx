'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import { useState, useEffect } from 'react'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import Chip from '@/components/Chip'
import Toast from '@/components/Toast'
import { useOneSignal } from '@/hooks/useOneSignal'
import OneSignalBanner from '@/components/OneSignalBanner'
import { useAnalytics } from '@/hooks/useAnalytics'

interface RemindersData {
  meal_times: string[]
  water_times: string[]
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<RemindersData>({
    meal_times: [],
    water_times: []
  })
  const [mealTimeInput, setMealTimeInput] = useState('')
  const [waterTimeInput, setWaterTimeInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [showOneSignalBanner, setShowOneSignalBanner] = useState(false)

  // Get OneSignal hook
  const { permission } = useOneSignal(process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID)
  
  // Analytics tracking
  const { trackReminderSet, trackInteraction } = useAnalytics()

  // Load current reminders on mount
  useEffect(() => {
    loadReminders()
  }, [])

  // Show OneSignal banner if permissions denied
  useEffect(() => {
    if (permission === 'denied') {
      setShowOneSignalBanner(true)
    }
  }, [permission])

  const loadReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      if (response.ok) {
        const data = await response.json()
        if (data.ok && data.data) {
          setReminders({
            meal_times: data.data.meal_times || [],
            water_times: data.data.water_times || []
          })
        }
      }
    } catch (error) {
      console.error('Failed to load reminders:', error)
    }
  }

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  const addMealTime = () => {
    if (validateTime(mealTimeInput) && !reminders.meal_times.includes(mealTimeInput)) {
      const newReminders = {
        ...reminders,
        meal_times: [...reminders.meal_times, mealTimeInput].sort()
      }
      setReminders(newReminders)
      setMealTimeInput('')
      saveReminders(newReminders)
    }
  }

  const removeMealTime = (time: string) => {
    const newReminders = {
      ...reminders,
      meal_times: reminders.meal_times.filter(t => t !== time)
    }
    setReminders(newReminders)
    saveReminders(newReminders)
  }

  const addWaterTime = () => {
    if (validateTime(waterTimeInput) && !reminders.water_times.includes(waterTimeInput)) {
      const newReminders = {
        ...reminders,
        water_times: [...reminders.water_times, waterTimeInput].sort()
      }
      setReminders(newReminders)
      setWaterTimeInput('')
      saveReminders(newReminders)
    }
  }

  const removeWaterTime = (time: string) => {
    const newReminders = {
      ...reminders,
      water_times: reminders.water_times.filter(t => t !== time)
    }
    setReminders(newReminders)
    saveReminders(newReminders)
  }

  const updateOneSignalTags = async (mealTimes: string[], waterTimes: string[]) => {
    try {
      if (typeof window === 'undefined' || !window.OneSignal) return

      // Set external user ID (profile ID)
      const profileResponse = await fetch('/api/me')
      if (profileResponse.ok) {
        const data = await profileResponse.json()
        if (data.ok && data.data?.id) {
          await window.OneSignal.login(data.data.id)
        }
      }

      // Update tags
      await window.OneSignal.User.addTags({
        meal_times: mealTimes.join(','),
        water_times: waterTimes.join(','),
      })
    } catch (error) {
      console.error('Failed to update OneSignal tags:', error)
    }
  }

  const saveReminders = async (remindersToSave: RemindersData = reminders) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(remindersToSave),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          setToastMessage('Reminders saved successfully!')
          setToastType('success')
          setShowToast(true)
          
          // Track reminder settings
          trackReminderSet('meal', remindersToSave.meal_times)
          trackReminderSet('water', remindersToSave.water_times)
          
          // Track notification permission if granted
          if (permission === 'granted') {
            trackInteraction('enable', 'notifications', { 
              mealCount: remindersToSave.meal_times.length, 
              waterCount: remindersToSave.water_times.length 
            })
          }
          
          // Update OneSignal tags
          await updateOneSignalTags(remindersToSave.meal_times, remindersToSave.water_times)
        } else {
          setToastMessage(data.error || 'Failed to save reminders')
          setToastType('error')
          setShowToast(true)
        }
      } else {
        setToastMessage('Failed to save reminders')
        setToastType('error')
        setShowToast(true)
      }
    } catch (error) {
      setToastMessage('Failed to save reminders')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, type: 'meal' | 'water') => {
    if (e.key === 'Enter') {
      if (type === 'meal') {
        addMealTime()
      } else {
        addWaterTime()
      }
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <Card variant="glass" className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Reminders</h1>
        <p className="text-text-secondary">Set up meal and water reminders</p>
      </Card>

      {/* Meal Reminders */}
      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-4">🍽️ Meal Reminders</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="time"
              value={mealTimeInput}
              onChange={(e) => setMealTimeInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'meal')}
              className="flex-1 px-3 py-2 bg-card/60 border border-card/40 rounded-xl text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <CTAButton 
              size="sm" 
              onClick={addMealTime}
              disabled={!validateTime(mealTimeInput) || isLoading}
            >
              Add
            </CTAButton>
          </div>
          
          {reminders.meal_times.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reminders.meal_times.map((time) => (
                <Chip
                  key={time}
                  label={time}
                  variant="removable"
                  onRemove={() => removeMealTime(time)}
                />
              ))}
            </div>
          )}
          
          {reminders.meal_times.length === 0 && (
            <p className="text-text-secondary text-sm text-center py-4">
              No meal reminders set
            </p>
          )}
        </div>
      </Card>

      {/* Water Reminders */}
      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-4">💧 Water Reminders</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="time"
              value={waterTimeInput}
              onChange={(e) => setWaterTimeInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'water')}
              className="flex-1 px-3 py-2 bg-card/60 border border-card/40 rounded-xl text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <CTAButton 
              size="sm" 
              onClick={addWaterTime}
              disabled={!validateTime(waterTimeInput) || isLoading}
            >
              Add
            </CTAButton>
          </div>
          
          {reminders.water_times.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reminders.water_times.map((time) => (
                <Chip
                  key={time}
                  label={time}
                  variant="removable"
                  onRemove={() => removeWaterTime(time)}
                />
              ))}
            </div>
          )}
          
          {reminders.water_times.length === 0 && (
            <p className="text-text-secondary text-sm text-center py-4">
              No water reminders set
            </p>
          )}
        </div>
      </Card>

      {/* Info */}
      <Card variant="glass">
        <h3 className="text-lg font-semibold text-text-primary mb-2">ℹ️ How it works</h3>
        <p className="text-sm text-text-secondary mb-3">
          Set reminder times for meals and water intake. You'll receive push notifications at these times to help you stay on track with your fitness goals.
        </p>
        <p className="text-xs text-text-secondary/60">
          Times are in 24-hour format (HH:MM). Reminders are automatically sorted chronologically.
        </p>
      </Card>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* OneSignal Banner */}
      {showOneSignalBanner && (
        <OneSignalBanner
          onClose={() => setShowOneSignalBanner(false)}
          onRetry={() => {
            setShowOneSignalBanner(false)
            // The hook will automatically retry permission request
          }}
        />
      )}
    </div>
  )
}
