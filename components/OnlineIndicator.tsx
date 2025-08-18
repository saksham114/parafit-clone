interface OnlineIndicatorProps {
  isOnline: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function OnlineIndicator({ isOnline, size = 'md', className = '' }: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-2 border-gray-900 ${
        isOnline ? 'bg-green-400' : 'bg-gray-500'
      } ${className}`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  )
}
