import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { degreesToCompass } from '../../lib/openmeteo'
import { hourLabel } from '../../lib/forecast'
import { windQuality, WIND_QUALITY_COLORS } from '../../lib/surfAnalysis'
import { ChartCard } from './ChartCard'

function WindTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const h = payload[0].payload
  const quality = h.windQ
  return (
    <div className="bg-retro-surface2 border border-retro-border rounded-lg px-3 py-2">
      <p className="text-retro-muted text-xs mb-0.5">{hourLabel(h.hourNum)}</p>
      <p className="text-white text-sm font-semibold">
        {h.windSpeed != null ? `${h.windSpeed}mph ${degreesToCompass(h.windDirection)}` : '—'}
        {h.windGusts != null && <span className="text-retro-muted font-normal"> · gusts {h.windGusts}</span>}
      </p>
      {quality && (
        <p className="text-xs font-semibold" style={{ color: WIND_QUALITY_COLORS[quality] }}>
          {quality}
        </p>
      )}
    </div>
  )
}

/** Axis tick: direction arrow above the hour label. */
function makeArrowTick(data) {
  return function ArrowTick({ x, y, payload }) {
    const h = data[payload.index]
    if (!h) return null
    const rotation = h.windDirection != null ? (h.windDirection + 180) % 360 : null
    return (
      <g transform={`translate(${x},${y})`}>
        {rotation != null && (
          <path
            d="M0 -5 L3.5 4.5 L0 2.2 L-3.5 4.5 Z"
            fill={WIND_QUALITY_COLORS[h.windQ] ?? '#A78BFA'}
            transform={`rotate(${rotation})`}
          />
        )}
        <text x={0} y={18} textAnchor="middle" fill="#A78BFA" fontSize={9} fontFamily="Inter">
          {hourLabel(h.hourNum)}
        </text>
      </g>
    )
  }
}

/**
 * Hourly wind for one forecast day. Bars are colored by quality relative to
 * the spot's beach orientation (offshore/cross/onshore); arrows on the axis
 * show where the wind is blowing toward.
 */
export function WindChart({ day, faces }) {
  if (!day?.hours?.length) return null

  const data = day.hours.map(h => ({
    ...h,
    windQ: windQuality(h.windDirection, faces),
  }))

  return (
    <ChartCard title="Wind">
      <div className="flex gap-4 mb-3">
        {Object.entries(WIND_QUALITY_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
            <span className="text-retro-muted text-[9px] uppercase">{label}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D1060" vertical={false} />
          <XAxis
            dataKey="hourNum"
            tick={makeArrowTick(data)}
            axisLine={false}
            tickLine={false}
            interval={2}
            height={30}
          />
          <YAxis
            unit="mph"
            domain={[0, 'auto']}
            tick={{ fill: '#A78BFA', fontSize: 9, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<WindTooltip />} cursor={{ fill: 'rgba(0,255,136,0.06)' }} />
          <Bar dataKey="windSpeed" radius={[3, 3, 0, 0]}>
            {data.map((h, i) => (
              <Cell key={i} fill={WIND_QUALITY_COLORS[h.windQ] ?? '#2D1060'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
