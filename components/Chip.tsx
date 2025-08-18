'use client'

import { X } from 'lucide-react'

interface ChipProps {
  label: string
  onRemove?: () => void
  variant?: 'default' | 'removable'
  className?: string
}

export default function Chip({ 
  label, 
  onRemove, 
  variant = 'default',
  className = '' 
}: ChipProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium ${className}`}>
      <span>{label}</span>
      {variant === 'removable' && onRemove && (
        <button
          onClick={onRemove}
          className="w-4 h-4 rounded-full bg-primary/30 hover:bg-primary/50 flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3 text-primary" />
        </button>
      )}
    </div>
  )
}

