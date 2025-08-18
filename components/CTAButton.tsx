import { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function CTAButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}: CTAButtonProps) {
  const baseClasses = 'font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface'
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-600 focus:ring-primary text-surface',
    secondary: 'bg-card hover:bg-card/80 focus:ring-text-secondary text-text-primary border border-card/40'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
