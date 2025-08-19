'use client'

import { ReactNode } from 'react'

interface Tab {
  icon: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

interface GradientHeaderProps {
  title: string
  subtitle?: string
  tabs?: Tab[]
}

export default function GradientHeader({ title, subtitle, tabs }: GradientHeaderProps) {
  return (
    <div className="relative bg-gradient-to-br from-brand-500 to-brand-700 rounded-b-2xl pt-[env(safe-area-inset-top)] pb-6 px-4 mb-6">
      <div className="text-white">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        {subtitle && (
          <p className="text-brand-100 text-sm">{subtitle}</p>
        )}
      </div>
      
      {tabs && tabs.length > 0 && (
        <div className="flex space-x-1 mt-4">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={tab.onClick}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                tab.active 
                  ? 'bg-white/20 text-white' 
                  : 'text-brand-100 hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
