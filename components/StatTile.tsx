interface StatTileProps {
  label: string
  value: string | number
  sublabel?: string
  className?: string
}

export default function StatTile({ label, value, sublabel, className = '' }: StatTileProps) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-2xl font-bold text-text-primary mb-1">{value}</p>
      <p className="text-sm font-medium text-text-secondary mb-1">{label}</p>
      {sublabel && (
        <p className="text-xs text-text-secondary/60">{sublabel}</p>
      )}
    </div>
  )
}
