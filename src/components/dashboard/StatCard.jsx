export function StatCard({ label, value, color = 'neon-yellow', icon: Icon, className = '', subtitle = '' }) {
  const colorMap = {
    'neon-yellow': 'text-neon-yellow',
    'neon-pink': 'text-neon-pink',
    'neon-cyan': 'text-neon-cyan',
    'neon-purple': 'text-neon-purple',
  }

  const textColor = colorMap[color] ?? 'text-neon-yellow'

  return (
    <div className={`gradient-border rounded-xl p-4 flex flex-col gap-2 bg-retro-surface ${className}`}>
      {Icon && (typeof Icon === 'function'
        ? <Icon className={`w-6 h-6 ${textColor}`} />
        : <span className="text-2xl">{Icon}</span>
      )}
      <span className={`font-display text-2xl leading-none ${textColor}`}>
        {value}
      </span>
      {subtitle && <span className="text-retro-muted/70 text-xs">{subtitle}</span>}
      <span className="text-retro-muted text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
