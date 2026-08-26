import { useMemo } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { useForecast } from '../../hooks/useForecast'
import { analyzeDay, windQuality, WIND_QUALITY_COLORS, DEFAULT_FACES } from '../../lib/surfAnalysis'
import { degreesToCompass } from '../../lib/openmeteo'
import { DirectionArrow } from './DirectionArrow'

/**
 * At-a-glance forecast card for one spot: today's rating, size range,
 * dominant swell, current wind, water temp, and a 48h size sparkline.
 * `framed: false` drops the card chrome so a parent (e.g. the sortable
 * wrapper on the Forecast tab) can provide its own.
 */
export function SpotForecastCard({ name, latitude, longitude, faces = DEFAULT_FACES, onClick, framed = true }) {
  const { forecast, loading, error } = useForecast(latitude, longitude)

  const today = useMemo(
    () => (forecast?.days?.[0] ? analyzeDay(forecast.days[0], faces) : null),
    [forecast, faces],
  )

  // Nearest current hour (spot timezones match the user's for a CA library).
  const now = useMemo(() => {
    if (!forecast) return null
    const nowHour = new Date().getHours()
    return forecast.days[0]?.hours.find(h => h.hourNum === nowHour) ?? forecast.hours[0]
  }, [forecast])

  const sparkline = useMemo(() => {
    if (!forecast || !now) return []
    const idx = forecast.hours.indexOf(now)
    return forecast.hours.slice(Math.max(idx, 0), Math.max(idx, 0) + 48)
  }, [forecast, now])

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${framed ? 'gradient-border rounded-xl bg-retro-surface ' : ''}p-4 w-full text-left transition-transform duration-150 active:scale-[0.99]`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-white font-display text-[10px] truncate">{name}</p>
        {today && (
          <span
            className="text-[9px] font-display uppercase border rounded px-1.5 py-0.5 shrink-0"
            style={{ color: today.ratingColor, borderColor: today.ratingColor }}
          >
            {today.ratingLabel}
          </span>
        )}
      </div>

      {loading && <p className="text-retro-muted text-xs animate-pulse">Loading forecast…</p>}
      {error && <p className="text-neon-pink text-xs">Couldn't load forecast.</p>}

      {today && now && (
        <>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-white text-lg font-semibold">
              {today.range.max != null
                ? today.range.min !== today.range.max
                  ? `${today.range.min}–${today.range.max}ft`
                  : `${today.range.max}ft`
                : '—'}
            </span>
            {today.swell && (
              <span className="flex items-center gap-1.5 text-retro-muted text-xs">
                <DirectionArrow degrees={today.swell.direction} size={13} />
                {today.swell.compass}
                {today.swell.period != null && ` @ ${Math.round(today.swell.period)}s`}
              </span>
            )}
            {now.windSpeed != null && (
              <span className="flex items-center gap-1.5 text-retro-muted text-xs">
                <DirectionArrow
                  degrees={now.windDirection}
                  size={13}
                  color={WIND_QUALITY_COLORS[windQuality(now.windDirection, faces)] ?? '#A78BFA'}
                />
                {now.windSpeed}mph {degreesToCompass(now.windDirection)}
              </span>
            )}
            {now.sst != null && (
              <span className="text-retro-muted text-xs">{now.sst}°F</span>
            )}
          </div>

          {sparkline.length > 1 && (
            <div className="mt-2 -mb-1">
              <ResponsiveContainer width="100%" height={36}>
                <AreaChart data={sparkline} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`spark-${latitude}-${longitude}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00CFFF" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00CFFF" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="waveHeight"
                    stroke="#00CFFF"
                    strokeWidth={1.5}
                    fill={`url(#spark-${latitude}-${longitude})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-retro-muted/50 text-[9px] uppercase">Next 48h</p>
            </div>
          )}
        </>
      )}
    </button>
  )
}
