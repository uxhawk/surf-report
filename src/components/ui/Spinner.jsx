export function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="w-8 h-8 border-2 border-retro-border border-t-neon-cyan rounded-full animate-spin" />
    </div>
  )
}
