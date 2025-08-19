'use client'
import Link from 'next/link'
import { Home, ShoppingBag, BarChart3, User2, Soup, Utensils, TrendingUp } from 'lucide-react'
import { usePathname } from 'next/navigation'

const items = [
  { href:'/dashboard', label:'Home', icon: Home },
  { href:'/recipes', label:'Recipes', icon: Utensils },
  { href:'/shop', label:'Shop', icon: ShoppingBag },
  { href:'/progress', label:'Progress', icon: TrendingUp },
  { href:'/plan', label:'', icon: Soup, center:true }, // center bowl
  { href:'/settings', label:'Me', icon: User2 },
  { href:'/support', label:'Support', icon: BarChart3 },
]

export default function BottomNav(){
  const path = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-screen-sm relative">
        <div className="bg-white/95 backdrop-blur border-t border-gray-200 px-2">
          <div className="grid grid-cols-7 items-end">
            {items.map(({href,label,icon:Icon,center})=>{
              const active = path?.startsWith(href)
              if (center) {
                return (
                  <div key={href} className="flex justify-center -translate-y-6">
                    <Link href={href} className="size-14 rounded-full bg-brand-600 text-white shadow-card grid place-items-center">
                      <Icon />
                    </Link>
                  </div>
                )
              }
              return (
                <Link key={href} href={href} className="flex flex-col items-center justify-center py-2 text-xs">
                  <Icon className={active?'text-brand-600':'text-gray-500'} />
                  <span className={active?'text-brand-700 font-medium':'text-gray-500'}>{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
