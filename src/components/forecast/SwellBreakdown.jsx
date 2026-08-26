import { degreesToCompass } from '../../lib/openmeteo'
import { DirectionArrow } from './DirectionArrow'
import { ChartCard } from './ChartCard'

const SWELL_COLORS = { primary: '#00CFFF', secondary: '#BF00FF', windwave: '#FFE600' }

/**
 * Surfline-style swell component rows (primary / secondary / wind waves)
 * for the midday reading of the selected day.
 */
export function SwellBreakdown({ swells }) {
  if (!swells?.length) return null

  return (
    <ChartCard title="Swell Breakdown">
      <div className="flex flex-col gap-3">
        {swells.map(s => (
          <div key={s.key} className="flex items-center gap-3">
            <DirectionArrow degrees={s.direction} size={16} color={SWELL_COLORS[s.key] ?? '#00CFFF'} />
            <span className="text-white text-sm font-semibold w-24">
              {s.height}ft
              {s.period != null && <span className="text-retro-muted font-normal"> @ {Math.round(s.period)}s</span>}
            </span>
            <span className="text-retro-muted text-xs w-10">{degreesToCompass(s.direction)}</span>
            <span className="text-retro-muted/70 text-[10px] uppercase ml-auto">{s.label}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
