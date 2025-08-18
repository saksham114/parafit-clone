import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'glass'
  className?: string
}

export default function Card({ children, variant = 'default', className }: CardProps) {
  const baseClasses = 'rounded-2xl p-4'
  
  const variants = {
    default: 'bg-card border border-card/20 shadow-sm',
    glass: 'bg-card/60 backdrop-blur-sm border border-card/20 shadow-soft'
  }

  return (
    <div className={cn(baseClasses, variants[variant], className)}>
      {children}
    </div>
  )
}
