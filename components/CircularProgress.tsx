'use client'

import { useEffect, useState } from 'react'

interface CircularProgressProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  className?: string
}

export default function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  className = ''
}: CircularProgressProps) {
  const [progress, setProgress] = useState(0)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progressValue = Math.min(value, max)
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progressValue / max) * circumference

  useEffect(() => {
    // Animate progress on mount
    const timer = setTimeout(() => {
      setProgress(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-card/40"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-text-primary">{progressValue}ml</div>
        <div className="text-sm text-text-secondary">of {max}ml</div>
      </div>
    </div>
  )
}

