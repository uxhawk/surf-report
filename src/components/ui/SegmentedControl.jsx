export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex rounded-lg border border-retro-border bg-retro-bg overflow-hidden">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer ${
            value === opt.value
              ? 'bg-neon-pink text-white'
              : 'text-retro-muted hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
