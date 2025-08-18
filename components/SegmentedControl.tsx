'use client'

interface SegmentedControlProps {
  options: Array<{ value: string; label: string }>
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  className = ''
}: SegmentedControlProps) {
  return (
    <div className={`flex bg-card/40 rounded-2xl p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            value === option.value
              ? 'bg-primary text-surface shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-card/60'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

