import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocations } from '../hooks/useLocations'
import { useForecast } from '../hooks/useForecast'
import { analyzeDay, DEFAULT_FACES } from '../lib/surfAnalysis'
import { weatherCodeInfo, dayLabel } from '../lib/forecast'
import { WaveHeightChart } from '../components/forecast/WaveHeightChart'
import { WindChart } from '../components/forecast/WindChart'
import { TideChart } from '../components/forecast/TideChart'
import { SwellBreakdown } from '../components/forecast/SwellBreakdown'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import { PlusBox } from 'pixelarticons/react/PlusBox.js'
import { Check } from 'pixelarticons/react/Check.js'

export default function ForecastDetail() {
  const [searchParams] = useSearchParams()
  const showToast = useToast()
  const { locations, createLocation } = useLocations()

  const lat = searchParams.get('lat') != null ? Number(searchParams.get('lat')) : null
  const lng = searchParams.get('lng') != null ? Number(searchParams.get('lng')) : null
  const name = searchParams.get('name') ?? 'Spot'
  const spotId = searchParams.get('spotId')
  const facesParam = searchParams.get('faces')

  // Prefer the saved spot's orientation; fall back to the curated value,
  // then the west-facing default.
  const savedSpot = spotId ? locations.find(l => l.id === spotId) : null
  const faces = savedSpot?.faces_degrees ?? (facesParam != null ? Number(facesParam) : DEFAULT_FACES)

  const { forecast, loading, error } = useForecast(lat, lng)
  const [dayIdx, setDayIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [justSavedId, setJustSavedId] = useState(null)

  const analyses = useMemo(
    () => (forecast?.days ?? []).map(d => analyzeDay(d, faces)),
    [forecast, faces],
  )

  const day = forecast?.days?.[dayIdx]
  const analysis = analyses[dayIdx]

  const alreadySaved = useMemo(() => {
    if (spotId || justSavedId) return true
    if (lat == null || lng == null) return true
    return locations.some(
      l => l.latitude != null && Math.abs(l.latitude - lat) < 0.002 && Math.abs(l.longitude - lng) < 0.002,
    )
  }, [spotId, justSavedId, locations, lat, lng])

  async function handleSave() {
    setSaving(true)
    const { data, error: saveError } = await createLocation({ name, latitude: lat, longitude: lng })
    setSaving(false)
    if (saveError) {
      showToast('Could not save spot.')
      return
    }
    setJustSavedId(data.id)
    showToast(`${name} added to your spots!`)
  }

  if (lat == null || lng == null) {
    return <p className="p-4 text-neon-pink text-sm">Missing coordinates for this spot.</p>
  }
  if (loading) return <Spinner />
  if (error || !forecast?.days?.length) {
    return <p className="p-4 text-neon-pink text-sm">Couldn't load the forecast. Try again in a minute.</p>
  }

  const weather = analysis ? weatherCodeInfo(analysis.weatherCode) : null

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {forecast.days.map((d, i) => {
          const a = analyses[i]
          const active = i === dayIdx
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setDayIdx(i)}
              className={`
                flex flex-col items-center gap-1 rounded-lg border px-3 py-2 shrink-0 transition-colors
                ${active ? 'border-neon-pink bg-neon-pink/10' : 'border-retro-border bg-retro-surface'}
              `}
              aria-pressed={active}
            >
              <span className={`text-[9px] font-display uppercase ${active ? 'text-neon-pink' : 'text-retro-muted'}`}>
                {dayLabel(d.date, { short: true })}
              </span>
              <span className="text-white text-xs font-semibold">
                {a?.range?.max != null ? `${a.range.max}ft` : '—'}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: a?.ratingColor ?? '#2D1060' }}
                title={a?.ratingLabel}
              />
            </button>
          )
        })}
      </div>

      {/* Analysis summary */}
      {analysis && (
        <div className="gradient-border rounded-xl bg-retro-surface p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-neon-yellow font-display text-[9px] uppercase">
              {dayLabel(analysis.date)}
            </h3>
            <span
              className="text-[9px] font-display uppercase border rounded px-1.5 py-0.5"
              style={{ color: analysis.ratingColor, borderColor: analysis.ratingColor }}
            >
              {analysis.ratingLabel}
            </span>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">{analysis.summary}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-retro-muted">
            {analysis.waterTemp != null && <span>🌊 {analysis.waterTemp}°F water</span>}
            {analysis.airHigh != null && <span>🌡️ {analysis.airHigh}°F air</span>}
            {weather?.label !== '—' && <span>{weather.emoji} {weather.label}</span>}
            {analysis.sunrise && <span>☀️ {analysis.sunriseLabel}–{analysis.sunsetLabel}</span>}
          </div>
        </div>
      )}

      {/* Charts */}
      <WaveHeightChart day={day} />
      <WindChart day={day} faces={faces} />
      <TideChart day={day} />
      <SwellBreakdown swells={analysis?.swells} />

      {!alreadySaved && (
        <Button onClick={handleSave} disabled={saving}>
          <PlusBox className="w-4 h-4" /> {saving ? 'Saving…' : 'Save to My Spots'}
        </Button>
      )}
      {justSavedId && (
        <p className="text-neon-green text-xs flex items-center gap-1.5 justify-center">
          <Check className="w-4 h-4" /> Saved to your spots
        </p>
      )}

      <p className="text-retro-muted/50 text-[10px] text-center">
        Forecast data from Open-Meteo · wave heights are open-ocean model output, not spot-adjusted
      </p>
    </div>
  )
}
