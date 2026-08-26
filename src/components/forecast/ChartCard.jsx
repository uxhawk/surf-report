export function ChartCard({ title, right, children }) {
  return (
    <div className="gradient-border rounded-xl p-4 bg-retro-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neon-yellow font-display text-[9px] leading-relaxed uppercase">
          {title}
        </h3>
        {right}
      </div>
      {children}
    </div>
  )
}
