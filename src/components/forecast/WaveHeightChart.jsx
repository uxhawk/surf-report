import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { degreesToCompass } from '../../lib/openmeteo'
import { hourLabel } from '../../lib/forecast'
import { ChartCard } from './ChartCard'

// Sequential ramp for wave height (magnitude): one hue, dim → bright on the
// dark surface. Height is redundantly encoded by bar length + axis + tooltip.
const HEIGHT_RAMP = [
  { max: 2, color: '#1E688C' },
  { max: 4, color: '#0090C8' },
  { max: 6, color: '#00CFFF' },
  { max: 9, color: '#7FE7FF' },
  { max: Infinity, color: '#C9F4FF' },
]

function heightColor(ft) {
  if (ft == null) return '#2D1060'
  return HEIGHT_RAMP.find(b => ft < b.max)?.color ?? HEIGHT_RAMP[HEIGHT_RAMP.length - 1].color
}

function WaveTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const h = payload[0].payload
  return (
    <div className="bg-retro-surface2 border border-retro-border rounded-lg px-3 py-2">
      <p className="text-retro-muted text-xs mb-0.5">{hourLabel(h.hourNum)}</p>
      <p className="text-white text-sm font-semibold">
        {h.waveHeight != null ? `${h.waveHeight}ft` : '—'}
        {h.wavePeriod != null && <span className="text-retro-muted font-normal"> @ {Math.round(h.wavePeriod)}s</span>}
      </p>
      {h.waveDirection != null && (
        <p className="text-retro-muted text-xs">from {degreesToCompass(h.waveDirection)}</p>
      )}
    </div>
  )
}

/**
 * Hourly wave height for one forecast day, color-coded by size band.
 * Hours outside the sunrise–sunset window render dimmed.
 */
export function WaveHeightChart({ day }) {
  if (!day?.hours?.length) return null

  const sunriseHour = day.sunrise ? Number(day.sunrise.slice(11, 13)) : 6
  const sunsetHour = day.sunset ? Number(day.sunset.slice(11, 13)) : 20

  return (
    <ChartCard title="Wave Height">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={day.hours} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D1060" vertical={false} />
          <XAxis
            dataKey="hourNum"
            tickFormatter={hourLabel}
            tick={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            unit="ft"
            domain={[0, 'auto']}
            tick={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<WaveTooltip />} cursor={{ fill: 'rgba(0,207,255,0.08)' }} />
          <Bar dataKey="waveHeight" radius={[3, 3, 0, 0]}>
            {day.hours.map((h, i) => (
              <Cell
                key={i}
                fill={heightColor(h.waveHeight)}
                fillOpacity={h.hourNum >= sunriseHour && h.hourNum <= sunsetHour ? 1 : 0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-retro-muted/60 text-[10px] mt-1">Dimmed bars are before sunrise / after sunset.</p>
    </ChartCard>
  )
}
