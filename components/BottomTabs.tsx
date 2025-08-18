'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/recipes', label: 'Recipes', icon: '🍽️' },
  { href: '/plan', label: 'Plan', icon: '📅' },
  { href: '/support', label: 'Support', icon: '💬' },
  { href: '/settings', label: 'Settings', icon: '⚙️' }
]

export default function BottomTabs() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-sm border-t border-card/20 shadow-soft z-50">
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className={`text-xs font-medium ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
