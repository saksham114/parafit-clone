'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import CircularProgress from '@/components/CircularProgress'
import { useAnalytics } from '@/hooks/useAnalytics'

// Dynamic imports for charts to prevent SSR bundling
const WaterChart = dynamic(() => import('@/components/charts/WaterChart'), { ssr: false })
const WeightChart = dynamic(() => import('@/components/charts/WeightChart'), { ssr: false })

export default function DashboardPage() {
  const [waterIntake, setWaterIntake] = useState(1200)
  const [todayWeight, setTodayWeight] = useState<number | null>(null)
  const [weightInput, setWeightInput] = useState('')
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null)
  
  const { trackWaterLog, trackWeightLog, trackComponentRender } = useAnalytics()

  // Track component render
  useEffect(() => {
    trackComponentRender('DashboardPage', { waterIntake, todayWeight })
  }, [trackComponentRender, waterIntake, todayWeight])

  // Load profile for personalized greeting
  useEffect(() => {
    loadProfile()
  }, [])

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Mock data for charts - in real app, this would come from API
  const waterData = [
    { date: '2024-01-01', ml: 2800 },
    { date: '2024-01-02', ml: 3200 },
    { date: '2024-01-03', ml: 2500 },
    { date: '2024-01-04', ml: 3000 },
    { date: '2024-01-05', ml: 2700 },
    { date: '2024-01-06', ml: 3100 },
    { date: '2024-01-07', ml: 2900 },
  ]

  const weightData = [
    { date: '2024-01-01', kg: 75.2 },
    { date: '2024-01-02', kg: 75.1 },
    { date: '2024-01-03', kg: 74.9 },
    { date: '2024-01-04', kg: 75.0 },
    { date: '2024-01-05', kg: 74.8 },
    { date: '2024-01-06', kg: 74.7 },
    { date: '2024-01-07', kg: 74.6 },
  ]

  const addWater = (amount: number) => {
    const newAmount = Math.min(waterIntake + amount, 3000)
    setWaterIntake(newAmount)
    
    // Track water logging
    trackWaterLog(amount, new Date().toISOString().split('T')[0])
  }

  const addWeight = () => {
    if (weightInput && !isNaN(Number(weightInput))) {
      const weight = Number(weightInput)
      setTodayWeight(weight)
      setWeightInput('')
      
      // Track weight logging
      trackWeightLog(weight, new Date().toISOString().split('T')[0])
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Greeting + Avatar Header */}
      <Card variant="glass" className="text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">👤</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {getGreeting()}{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-text-secondary">Ready to crush your fitness goals today?</p>
      </Card>

      {/* Today's Plan Card */}
      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Today's Plan</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-card/40 rounded-xl">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-warning rounded-full mr-3"></div>
              <span className="text-text-primary font-medium">Breakfast</span>
            </div>
            <span className="text-text-secondary">Oatmeal with Berries</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-card/40 rounded-xl">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-accent rounded-full mr-3"></div>
              <span className="text-text-primary font-medium">Lunch</span>
            </div>
            <span className="text-text-secondary">Grilled Chicken Salad</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-card/40 rounded-xl">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
              <span className="text-text-primary font-medium">Dinner</span>
            </div>
            <span className="text-text-secondary">Salmon with Quinoa</span>
          </div>
        </div>
        <CTAButton variant="secondary" size="sm" className="w-full mt-4">
          View Full Plan
        </CTAButton>
      </Card>

      {/* Water Tracking */}
      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Water Intake</h2>
        <div className="flex items-center justify-between">
          <CircularProgress value={waterIntake} max={3000} size={100} />
          <div className="flex flex-col gap-2">
            <CTAButton 
              size="sm" 
              onClick={() => addWater(250)}
              className="w-20"
            >
              +250ml
            </CTAButton>
            <CTAButton 
              size="sm" 
              onClick={() => addWater(500)}
              className="w-20"
            >
              +500ml
            </CTAButton>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-text-secondary">Today's total: {waterIntake}ml</p>
        </div>
      </Card>

      {/* Weight Tracking */}
      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Weight Today</h2>
        {todayWeight ? (
          <div className="text-center">
            <p className="text-3xl font-bold text-text-primary mb-2">{todayWeight} kg</p>
            <CTAButton 
              variant="secondary" 
              size="sm"
              onClick={() => setTodayWeight(null)}
            >
              Change
            </CTAButton>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Enter weight (kg)"
              className="flex-1 px-3 py-2 bg-card/60 border border-card/40 rounded-xl text-text-primary placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <CTAButton size="sm" onClick={addWeight}>
              Add
            </CTAButton>
          </div>
        )}
      </Card>

      {/* Mini Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-3">Water (7 days)</h3>
          <WaterChart data={waterData} />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-3">Weight (7 days)</h3>
          <WeightChart data={weightData} />
        </Card>
      </div>
    </div>
  )
}
