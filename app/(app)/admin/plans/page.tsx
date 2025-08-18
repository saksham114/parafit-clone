'use client'

import { useState, useEffect } from 'react'
import type { Recipe, Plan, PlanDay } from '@/lib/types'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import Toast from '@/components/Toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Save, Trash2, GripVertical, X, Search } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface PlanForm {
  name: string
  goal: 'lose' | 'maintain' | 'gain'
  daily_kcal: number
  macros: Record<string, any>
}

interface MealSlot {
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  recipe_id?: string
  recipe?: Recipe
}

interface DayPlan {
  day_index: number
  meals: MealSlot[]
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [showPlanBuilder, setShowPlanBuilder] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [planForm, setPlanForm] = useState<PlanForm>({
    name: '',
    goal: 'maintain',
    daily_kcal: 2000,
    macros: {}
  })
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const { trackInteraction } = useAnalytics()

  useEffect(() => {
    loadPlans()
    loadRecipes()
  }, [])

  useEffect(() => {
    filterRecipes()
  }, [recipes, searchTerm])

  const loadPlans = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/plans')
      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          setPlans(data.data)
        } else {
          setToast({ type: 'error', message: data.error })
        }
      } else {
        setToast({ type: 'error', message: 'Failed to load plans' })
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load plans' })
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecipes = async () => {
    try {
      const response = await fetch('/api/recipes')
      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          setRecipes(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to load recipes:', error)
    }
  }

  const filterRecipes = () => {
    const filtered = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      recipe.is_public
    )
    setFilteredRecipes(filtered)
  }

  const openPlanForm = () => {
    setPlanForm({
      name: '',
      goal: 'maintain',
      daily_kcal: 2000,
      macros: {}
    })
    setShowPlanForm(true)
  }

  const openPlanBuilder = (plan: Plan) => {
    setCurrentPlan(plan)
    // Initialize with 7 days
    const initialDays: DayPlan[] = Array.from({ length: 7 }, (_, i) => ({
      day_index: i,
      meals: [
        { type: 'breakfast' },
        { type: 'lunch' },
        { type: 'snack' },
        { type: 'dinner' }
      ]
    }))
    setDayPlans(initialDays)
    setShowPlanBuilder(true)
  }

  const createPlan = async () => {
    if (!planForm.name || !planForm.goal || !planForm.daily_kcal) {
      setToast({ type: 'error', message: 'Please fill in all required fields' })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          setToast({ type: 'success', message: 'Plan created successfully!' })
          setShowPlanForm(false)
          loadPlans()
          // Open plan builder for the new plan
          openPlanBuilder(data.data)
          
          // Track plan creation
          trackInteraction('create', 'plan', {
            planName: planForm.name,
            goal: planForm.goal,
            dailyKcal: planForm.daily_kcal
          })
        } else {
          setToast({ type: 'error', message: data.error })
        }
      } else {
        setToast({ type: 'error', message: 'Failed to create plan' })
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to create plan' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const savePlanDays = async () => {
    if (!currentPlan || dayPlans.length === 0) {
      setToast({ type: 'error', message: 'No plan days to save' })
      return
    }

    setIsSubmitting(true)
    try {
      // Convert day plans to plan day inputs
      const planDayInputs = dayPlans.map(day => ({
        day_index: day.day_index,
        breakfast: day.meals.find(m => m.type === 'breakfast')?.recipe_id,
        lunch: day.meals.find(m => m.type === 'lunch')?.recipe_id,
        snack: day.meals.find(m => m.type === 'snack')?.recipe_id,
        dinner: day.meals.find(m => m.type === 'dinner')?.recipe_id
      }))

      const response = await fetch('/api/plan-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planDayInputs)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          setToast({ type: 'success', message: 'Plan days saved successfully!' })
          setShowPlanBuilder(false)
          
          // Track plan day assignment
          trackInteraction('assign', 'plan_days', {
            planId: currentPlan.id,
            planName: currentPlan.name,
            dayCount: dayPlans.length,
            hasBreakfast: dayPlans.some(d => d.meals.some(m => m.type === 'breakfast' && m.recipe)),
            hasLunch: dayPlans.some(d => d.meals.some(m => m.type === 'lunch' && m.recipe)),
            hasSnack: dayPlans.some(d => d.meals.some(m => m.type === 'snack' && m.recipe)),
            hasDinner: dayPlans.some(d => d.meals.some(m => m.type === 'dinner' && m.recipe))
          })
        } else {
          setToast({ type: 'error', message: data.error })
        }
      } else {
        setToast({ type: 'error', message: 'Failed to save plan days' })
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to save plan days' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const assignRecipe = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner', recipe: Recipe) => {
    setDayPlans(prev => prev.map(day => 
      day.day_index === dayIndex 
        ? {
            ...day,
            meals: day.meals.map(meal => 
              meal.type === mealType 
                ? { ...meal, recipe_id: recipe.id, recipe }
                : meal
            )
          }
        : day
    ))
  }

  const removeRecipe = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    setDayPlans(prev => prev.map(day => 
      day.day_index === dayIndex 
        ? {
            ...day,
            meals: day.meals.map(meal => 
              meal.type === mealType 
                ? { type: meal.type }
                : meal
            )
          }
        : day
    ))
  }

  const addDay = () => {
    const newDayIndex = dayPlans.length
    const newDay: DayPlan = {
      day_index: newDayIndex,
      meals: [
        { type: 'breakfast' },
        { type: 'lunch' },
        { type: 'snack' },
        { type: 'dinner' }
      ]
    }
    setDayPlans(prev => [...prev, newDay])
  }

  const removeDay = (dayIndex: number) => {
    if (dayPlans.length > 1) {
      setDayPlans(prev => prev.filter(day => day.day_index !== dayIndex))
    }
  }

  const getMealLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Manage Meal Plans</h1>
            <p className="text-gray-400">Create and manage meal plans for users</p>
          </div>
          <CTAButton onClick={openPlanForm}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </CTAButton>
        </div>
      </div>

      {/* Plans List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Existing Plans</h2>
            {plans.length === 0 ? (
              <p className="text-gray-400">No plans created yet. Create your first plan to get started.</p>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-white">{plan.name}</h3>
                      <p className="text-sm text-gray-400">
                        Goal: {plan.goal} • Daily Calories: {plan.daily_kcal}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <CTAButton size="sm" onClick={() => openPlanBuilder(plan)}>
                        Build Plan
                      </CTAButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Plan Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Create New Plan</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name *</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal</label>
                <select
                  value={planForm.goal}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, goal: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Daily Calories</label>
                <input
                  type="number"
                  value={planForm.daily_kcal}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, daily_kcal: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setShowPlanForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <CTAButton
                onClick={createPlan}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Plan'}
              </CTAButton>
            </div>
          </div>
        </div>
      )}

      {/* Plan Builder Modal */}
      {showPlanBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Build Plan: {currentPlan?.name}
                </h2>
                <button
                  onClick={() => setShowPlanBuilder(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Recipe Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Days Grid */}
              <div className="space-y-6">
                {dayPlans.map((day, dayIndex) => (
                  <Card key={day.day_index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Day {day.day_index + 1}</h3>
                      {dayPlans.length > 1 && (
                        <button
                          onClick={() => removeDay(day.day_index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {day.meals.map((meal) => (
                        <div key={meal.type} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {getMealLabel(meal.type)}
                          </label>
                          
                          {meal.recipe ? (
                            <div className="relative">
                              <div className="p-3 bg-gray-800 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                      {meal.recipe.title}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {meal.recipe.calories || 0} cal
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeRecipe(day.day_index, meal.type)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                              <p className="text-sm text-gray-400 text-center">No recipe</p>
                            </div>
                          )}

                          {/* Recipe Picker */}
                          <div className="relative">
                            <select
                              onChange={(e) => {
                                const recipe = recipes.find(r => r.id === e.target.value)
                                if (recipe) {
                                  assignRecipe(day.day_index, meal.type, recipe)
                                }
                              }}
                              value=""
                              className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:ring-1 focus:ring-teal-500"
                            >
                              <option value="">Choose recipe...</option>
                              {filteredRecipes.map((recipe) => (
                                <option key={recipe.id} value={recipe.id}>
                                  {recipe.title} ({recipe.calories || 0} cal)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add Day Button */}
              <div className="mt-6">
                <CTAButton onClick={addDay} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Day
                </CTAButton>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setShowPlanBuilder(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <CTAButton
                onClick={savePlanDays}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Plan Days'}
              </CTAButton>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
