'use client'
import { Bell, MessageCircleMore, Menu } from 'lucide-react'
import Link from 'next/link'

export default function AppBar({ title='Home' }:{ title?:string }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-screen-sm mx-auto flex items-center gap-3 px-4 py-3">
        <button aria-label="Menu" className="p-2 rounded-full hover:bg-gray-100"><Menu size={22}/></button>
        <h1 className="text-xl font-semibold flex-1">{title}</h1>
        <Link href="/support" className="p-2 rounded-full hover:bg-gray-100"><MessageCircleMore size={22}/></Link>
        <Link href="/settings/reminders" className="p-2 rounded-full hover:bg-gray-100"><Bell size={22}/></Link>
      </div>
    </header>
  )
}
