'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { useState, useEffect } from 'react'
import dynamicImport from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'
import BannerCarousel from '@/components/ui/BannerCarousel'
import FAB from '@/components/FAB'
import Pill from '@/components/ui/Pill'
import { useAnalytics } from '@/hooks/useAnalytics'

// Dynamic imports for charts to prevent SSR bundling
const WaterChart = dynamicImport(() => import('@/components/charts/WaterChart'), { ssr: false })
const WeightChart = dynamicImport(() => import('@/components/charts/WeightChart'), { ssr: false })

export default function DashboardPage() {
  const [waterIntake, setWaterIntake] = useState(1500)
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

  const complianceData = [
    { name: 'Taken', value: 8, color: '#2ECC71' },
    { name: 'Missed', value: 2, color: '#E74C3C' },
    { name: 'Pending', value: 3, color: '#F5B041' }
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">Ready to crush your fitness goals today?</p>
      </div>

      {/* Banner Carousel */}
      <BannerCarousel images={['/banners/1.jpg', '/banners/2.jpg']} />

      {/* Lab Tests Promo */}
      <div className="px-4">
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-brand-500 to-brand-600 relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative p-4 text-white">
              <h3 className="text-lg font-semibold mb-1">Lab Tests</h3>
              <p className="text-sm text-brand-100">Get your health insights</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Habit Trackers */}
      <div>
        <SectionTitle>Habit Trackers</SectionTitle>
        <div className="px-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="chip chip-brand shrink-0">
              <span className="mr-2">💧</span>
              Water
            </div>
            <div className="chip chip-soft shrink-0">
              <span className="mr-2">😴</span>
              Sleep
            </div>
            <div className="chip chip-success shrink-0">
              <span className="mr-2">👟</span>
              Steps
            </div>
            <div className="chip chip-warn shrink-0">
              <span className="mr-2">🔥</span>
              Calorie
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <SectionTitle>Quick Actions</SectionTitle>
        <div className="px-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">My Plan</h3>
                <p className="text-sm text-gray-600">View today's meals</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🛍️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Shop</h3>
                <p className="text-sm text-gray-600">Get healthy products</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Today's Plan */}
      <div>
        <SectionTitle>Today's Plan</SectionTitle>
        <div className="px-4">
          <Card>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🌅</span>
                    <span className="font-medium text-gray-900">Breakfast</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Oatmeal with Berries</span>
                    <Pill variant="taken">Taken</Pill>
                    <span className="text-sm text-gray-500">8:00 AM</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">☀️</span>
                    <span className="font-medium text-gray-900">Lunch</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Grilled Chicken Salad</span>
                    <Pill variant="pending">Pending</Pill>
                    <span className="text-sm text-gray-500">1:00 PM</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🌙</span>
                    <span className="font-medium text-gray-900">Dinner</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Salmon with Quinoa</span>
                    <Pill variant="pending">Pending</Pill>
                    <span className="text-sm text-gray-500">7:00 PM</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Health Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        {/* Water Card */}
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Water Intake</h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-brand-600 mb-1">
                {(waterIntake / 1000).toFixed(1)} L
              </div>
              <div className="text-sm text-gray-600">of 3.0 L goal</div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => addWater(250)}
                className="flex-1 py-2 bg-brand-100 text-brand-700 rounded-xl font-medium hover:bg-brand-200 transition-colors"
              >
                +250ml
              </button>
              <button
                onClick={() => addWater(500)}
                className="flex-1 py-2 bg-brand-100 text-brand-700 rounded-xl font-medium hover:bg-brand-200 transition-colors"
              >
                +500ml
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Weight Card */}
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Weight Today</h3>
            {todayWeight ? (
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-2">{todayWeight} kg</div>
                <button
                  onClick={() => setTodayWeight(null)}
                  className="text-sm text-brand-600 hover:text-brand-700"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="Enter weight (kg)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button
                  onClick={addWeight}
                  className="w-full py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                >
                  Add Weight
                </button>
              </div>
            )}
            {todayWeight && (
              <div className="mt-4 h-24">
                <WeightChart data={weightData} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Water (7 days)</h3>
            <WaterChart data={waterData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Weight (7 days)</h3>
            <WeightChart data={weightData} />
          </CardContent>
        </Card>
      </div>

      {/* FAB for quick water logging */}
      <FAB onWaterLog={addWater} />
    </div>
  )
}
