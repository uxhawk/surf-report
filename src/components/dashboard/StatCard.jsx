export function StatCard({ label, value, color = 'neon-yellow', icon, className = '', subtitle = '' }) {
  const colorMap = {
    'neon-yellow': 'text-neon-yellow',
    'neon-pink': 'text-neon-pink',
    'neon-cyan': 'text-neon-cyan',
    'neon-purple': 'text-neon-purple',
  }

  return (
    <div className={`gradient-border rounded-xl p-4 flex flex-col gap-2 bg-retro-surface ${className}`}>
      {icon && <span className="text-2xl">{icon}</span>}
      <span className={`font-display text-2xl leading-none ${colorMap[color] ?? 'text-neon-yellow'}`}>
        {value}
      </span>
      {subtitle && <span className="text-retro-muted/70 text-xs">{subtitle}</span>}
      <span className="text-retro-muted text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
