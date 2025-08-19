'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/recipes', label: 'Recipes', icon: '🍽️' },
  { href: '/shop', label: 'Shop', icon: '🛍️' },
  { href: '/progress', label: 'Progress', icon: '📊' },
  { href: '/plan', label: 'Plan', icon: '📅' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
  { href: '/support', label: 'Support', icon: '💬' }
]

export default function BottomTabs() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-7">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center py-3 px-2 transition-all duration-200 ${
                isActive
                  ? 'text-brand-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-600 rounded-full"></div>
              )}
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className={`text-xs font-medium ${
                isActive ? 'text-brand-600' : 'text-gray-500'
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
