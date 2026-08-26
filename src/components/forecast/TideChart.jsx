import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from 'recharts'
import { hourLabel } from '../../lib/forecast'
import { findTideEvents } from '../../lib/surfAnalysis'
import { ChartCard } from './ChartCard'

function TideTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const h = payload[0].payload
  return (
    <div className="bg-retro-surface2 border border-retro-border rounded-lg px-3 py-2">
      <p className="text-retro-muted text-xs mb-0.5">{hourLabel(h.hourNum)}</p>
      <p className="text-white text-sm font-semibold">{h.tide != null ? `${h.tide}ft` : '—'}</p>
    </div>
  )
}

/** Modeled tide curve for one forecast day, with high/low markers. */
export function TideChart({ day }) {
  const hours = day?.hours?.filter(h => h.tide != null) ?? []
  if (!hours.length) return null

  const events = findTideEvents(day.hours)

  return (
    <ChartCard title="Tide">
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={day.hours} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CFFF" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#00CFFF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            domain={['auto', 'auto']}
            tick={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<TideTooltip />} cursor={{ stroke: '#2D1060' }} />
          <Area type="monotone" dataKey="tide" stroke="#00CFFF" strokeWidth={2} fill="url(#tideFill)" />
          {events.map((e, i) => (
            <ReferenceDot
              key={i}
              x={Number(e.time.slice(11, 13))}
              y={e.height}
              r={3.5}
              fill={e.type === 'high' ? '#00CFFF' : '#BF00FF'}
              stroke="#130028"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      {events.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {events.map((e, i) => (
            <span key={i} className="text-[10px] text-retro-muted">
              <span className={e.type === 'high' ? 'text-neon-cyan' : 'text-neon-purple'}>
                {e.type === 'high' ? '▲ High' : '▼ Low'}
              </span>{' '}
              {hourLabel(e.time)} · {e.height}ft
            </span>
          ))}
        </div>
      )}
      <p className="text-retro-muted/60 text-[10px] mt-2">
        Modeled sea level (Open-Meteo) — timing is approximate, not official tide tables.
      </p>
    </ChartCard>
  )
}
