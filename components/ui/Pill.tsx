interface PillProps {
  variant: 'taken' | 'missed' | 'pending'
  children: React.ReactNode
  className?: string
}

export default function Pill({ variant, children, className = '' }: PillProps) {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium'
  
  const variantClasses = {
    taken: 'bg-ok-100 text-ok-700',
    missed: 'bg-danger-100 text-danger-700',
    pending: 'bg-warn-100 text-warn-700'
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
