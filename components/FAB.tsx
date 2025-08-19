'use client'

import { useState } from 'react'

interface FABProps {
  onWaterLog: (amount: number) => void
}

export default function FAB({ onWaterLog }: FABProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleQuickLog = (amount: number) => {
    onWaterLog(amount)
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
      {/* Quick action sheet */}
      {isOpen && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-card p-3 mb-2">
          <div className="flex space-x-2">
            <button
              onClick={() => handleQuickLog(250)}
              className="px-4 py-2 bg-brand-100 text-brand-700 rounded-xl font-medium hover:bg-brand-200 transition-colors"
            >
              +250ml
            </button>
            <button
              onClick={() => handleQuickLog(500)}
              className="px-4 py-2 bg-brand-100 text-brand-700 rounded-xl font-medium hover:bg-brand-200 transition-colors"
            >
              +500ml
            </button>
          </div>
        </div>
      )}
      
      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-600 rounded-full shadow-card flex items-center justify-center text-white hover:bg-brand-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-200"
        aria-label="Quick water log"
      >
        <span className="text-2xl">💧</span>
      </button>
    </div>
  )
}
