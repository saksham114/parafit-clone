'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { TrendingDown, TrendingUp, Target } from 'lucide-react'
import SegmentedControl from '@/components/SegmentedControl'

// Dynamic import for chart with SSR disabled
const WeightChart = dynamic(() => import('@/components/charts/WeightChart'), { ssr: false })

// Mock data
const weightData = [
  { date: '2024-01-01', kg: 75 },
  { date: '2024-01-08', kg: 74.2 },
  { date: '2024-01-15', kg: 73.8 },
  { date: '2024-01-22', kg: 73.1 },
  { date: '2024-01-29', kg: 72.5 },
  { date: '2024-02-05', kg: 72.0 },
  { date: '2024-02-12', kg: 71.6 }
]

const weightSummary = {
  start: 75,
  current: 71.6,
  target: 68
}

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { value: 'overview', label: 'OVERVIEW' },
    { value: 'progress-log', label: 'PROGRESS LOG' }
  ]

  const getWeightChange = () => {
    const change = weightSummary.current - weightSummary.start
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : 'down',
      percentage: Math.abs((change / weightSummary.start) * 100)
    }
  }

  const weightChange = getWeightChange()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 p-4 max-w-screen-sm mx-auto">
        {/* Tabs */}
        <SegmentedControl
          options={tabs}
          value={activeTab}
          onChange={setActiveTab}
          className="w-full"
        />

        {activeTab === 'overview' && (
          <>
            {/* Weight Tracker Summary Card */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                    <span className="text-sm text-gray-600">Start</span>
                  </div>
                  <span className="font-semibold text-gray-900">{weightSummary.start} kg</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-600"></div>
                    <span className="text-sm text-gray-600">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{weightSummary.current} kg</span>
                    {weightChange.direction === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-brand-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-brand-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-700"></div>
                    <span className="text-sm text-gray-600">Target</span>
                  </div>
                  <span className="font-semibold text-gray-900">{weightSummary.target} kg</span>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Change</span>
                    <span className={`font-medium ${weightChange.direction === 'down' ? 'text-brand-600' : 'text-brand-500'}`}>
                      {weightChange.direction === 'down' ? '-' : '+'}{weightChange.value.toFixed(1)} kg ({weightChange.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Gauge Card */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Status</h3>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-24 bg-gradient-to-b from-brand-100 to-brand-200 rounded-full mb-2 flex items-end justify-center">
                    <div className="w-8 h-12 bg-brand-500 rounded-full mb-1"></div>
                  </div>
                  <span className="text-xs text-gray-600">Your BMI</span>
                </div>
                
                <div className="flex-1 ml-6">
                  <div className="relative">
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>18.5</span>
                      <span>24.9</span>
                      <span>29.9</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-2xl font-bold text-brand-600">22.4</span>
                    <p className="text-sm text-brand-600 font-medium">Normal Weight</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight Chart */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Trend</h3>
              <WeightChart data={weightData} />
            </div>
          </>
        )}

        {activeTab === 'progress-log' && (
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Log</h3>
            <div className="text-center text-gray-500 py-8">
              <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Progress log feature coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
