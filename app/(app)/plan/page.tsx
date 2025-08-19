'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function PlanPage() {
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { trackPlanDayView, trackInteraction } = useAnalytics()

  // Load current plan on mount
  useEffect(() => {
    loadCurrentPlan()
  }, [])

  const loadCurrentPlan = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/plans')
      if (response.ok) {
        const data = await response.json()
        if (data.ok && data.data.length > 0) {
          // Get the first plan for now - in real app, you'd get the active plan
          setCurrentPlan(data.data[0])
          
          // Track plan view
          trackInteraction('view', 'plan_overview', {
            planId: data.data[0].id,
            planName: data.data[0].name
          })
        }
      }
    } catch (error) {
      console.error('Failed to load plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanDayClick = (dayIndex: number) => {
    trackPlanDayView(dayIndex, currentPlan?.id)
  }

  // Mock today's plan data - in real app, this would come from API
  const todayPlan = {
    breakfast: { 
      name: "Oatmeal with Berries", 
      calories: 280, 
      time: "7:00 AM",
      recipeId: "1"
    },
    lunch: { 
      name: "Grilled Chicken Salad", 
      calories: 320, 
      time: "12:00 PM",
      recipeId: "2"
    },
    snack: { 
      name: "Greek Yogurt with Nuts", 
      calories: 180, 
      time: "3:00 PM",
      recipeId: "3"
    },
    dinner: { 
      name: "Salmon with Quinoa", 
      calories: 450, 
      time: "7:00 PM",
      recipeId: "4"
    }
  };

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'bg-warning/20' },
    { key: 'lunch', label: 'Lunch', icon: '☀️', color: 'bg-accent/20' },
    { key: 'snack', label: 'Snack', icon: '🍎', color: 'bg-green-500/20' },
    { key: 'dinner', label: 'Dinner', icon: '🌙', color: 'bg-primary/20' }
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Today's Plan Header */}
      <Card variant="glass" className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Today's Plan</h1>
        <p className="text-text-secondary">Your meals for today</p>
      </Card>

      {/* Today's Meals */}
      <div className="space-y-4">
        {mealTypes.map((mealType) => {
          const meal = todayPlan[mealType.key as keyof typeof todayPlan];
          return (
            <Card key={mealType.key} variant="glass">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{mealType.icon}</span>
                  <h3 className="text-lg font-semibold text-text-primary">{mealType.label}</h3>
                </div>
                <span className="text-sm text-text-secondary">{meal?.time}</span>
              </div>
              
              {meal ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-card/40 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{meal.name}</p>
                      <p className="text-sm text-text-secondary">{meal.calories} calories</p>
                    </div>
                    <Link href={`/recipes/${meal.recipeId}`}>
                      <CTAButton size="sm" variant="secondary">
                        View Recipe
                      </CTAButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-text-secondary mb-3">No meal planned</p>
                  <CTAButton size="sm" variant="secondary">
                    Add Meal
                  </CTAButton>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Weekly Overview */}
      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-4">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="w-10 h-10 bg-card/40 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-xs font-medium text-text-secondary">{day}</span>
              </div>
              <div className="text-xs text-text-secondary">
                {index === 0 ? '3 meals' : index === 3 ? '2 meals' : '4 meals'}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <CTAButton variant="secondary" size="sm" className="w-full">
            <span className="flex items-center justify-center">
              <span className="mr-2">🍽️</span>
              Plan Week
            </span>
          </CTAButton>
          <CTAButton size="sm" className="w-full">
            <span className="flex items-center justify-center">
              <span className="mr-2">📅</span>
              View Calendar
            </span>
          </CTAButton>
        </div>
      </Card>
    </div>
  )
}
