/**
 * Arrow for swell/wind direction. Meteorological directions are "coming
 * FROM", so the arrow is rotated 180° to point in the direction of travel
 * (a SW swell shows an arrow pointing northeast, like Surfline).
 */
export function DirectionArrow({ degrees, size = 14, color = '#00CFFF', className = '' }) {
  if (degrees == null || isNaN(degrees)) {
    return <span className="text-retro-muted text-xs">—</span>
  }
  const rotation = (degrees + 180) % 360
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`inline-block shrink-0 ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <path d="M12 2 L19 21 L12 16.5 L5 21 Z" fill={color} />
    </svg>
  )
}
