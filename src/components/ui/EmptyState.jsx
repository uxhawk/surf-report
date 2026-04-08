export function EmptyState({ icon = '🌊', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-neon-yellow font-display text-xs leading-relaxed">{title}</h3>
      {message && <p className="text-retro-muted text-sm max-w-xs">{message}</p>}
      {action}
    </div>
  )
}
