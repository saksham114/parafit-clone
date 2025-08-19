'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
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
      recipeId: "1",
      status: "taken" as const
    },
    lunch: { 
      name: "Grilled Chicken Salad", 
      calories: 320, 
      time: "12:00 PM",
      recipeId: "2",
      status: "pending" as const
    },
    snack: { 
      name: "Greek Yogurt with Nuts", 
      calories: 180, 
      time: "3:00 PM",
      recipeId: "3",
      status: "pending" as const
    },
    dinner: { 
      name: "Salmon with Quinoa", 
      calories: 450, 
      time: "7:00 PM",
      recipeId: "4",
      status: "pending" as const
    }
  };

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { key: 'lunch', label: 'Lunch', icon: '☀️' },
    { key: 'snack', label: 'Snack', icon: '🍎' },
    { key: 'dinner', label: 'Dinner', icon: '🌙' }
  ];

  const getStatusText = (status: 'taken' | 'missed' | 'pending') => {
    switch (status) {
      case 'taken': return 'Taken'
      case 'missed': return 'Missed'
      case 'pending': return 'Pending'
      default: return 'Pending'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-sm mx-auto p-4 space-y-4">
        {/* Today's Meals */}
        <div className="space-y-4">
          {mealTypes.map((mealType) => {
            const meal = todayPlan[mealType.key as keyof typeof todayPlan];
            return (
              <Card key={mealType.key}>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{mealType.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{mealType.label}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Pill variant={meal?.status || "pending"}>
                        {getStatusText(meal?.status || "pending")}
                      </Pill>
                      <span className="text-sm text-gray-500">{meal?.time}</span>
                    </div>
                  </div>
                  
                  {meal ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{meal.name}</p>
                          <p className="text-sm text-gray-600">{meal.calories} calories</p>
                        </div>
                        <Link href={`/recipes/${meal.recipeId}`}>
                          <button className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium hover:bg-brand-200 transition-colors min-h-[44px]">
                            View Recipe
                          </button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-3">No meal planned</p>
                      <button className="px-4 py-2 bg-brand-600 text-white rounded-full text-sm font-medium hover:bg-brand-700 transition-colors min-h-[44px]">
                        Add Meal
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Weekly Overview */}
        <Card>
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">This Week</h2>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-medium text-gray-600">{day}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {index === 0 ? '3 meals' : index === 3 ? '2 meals' : '4 meals'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors min-h-[44px]">
                <span className="flex items-center justify-center">
                  <span className="mr-2">🍽️</span>
                  Plan Week
                </span>
              </button>
              <button className="w-full py-2 px-4 bg-brand-600 text-white rounded-full font-medium hover:bg-brand-700 transition-colors min-h-[44px]">
                <span className="flex items-center justify-center">
                  <span className="mr-2">📅</span>
                  View Calendar
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
