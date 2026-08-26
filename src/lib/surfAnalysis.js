import { degreesToCompass } from './openmeteo'
import { clockLabel, hourLabel } from './forecast'

/**
 * Rule-based surf condition analysis.
 *
 * analyzeDay() returns a structured `conditions` object plus a template-built
 * `summary` string. The structure is the contract: if we later add an
 * LLM-written summary, it gets this same object as input and only the
 * text generation changes.
 */

export const RATING_LABELS = ['Flat', 'Poor', 'Fair', 'Good', 'Epic']
export const RATING_COLORS = ['#A78BFA', '#FF2D78', '#FFE600', '#00CFFF', '#00FF88']

// Default beach orientation when a spot has no faces_degrees set.
// West-facing is the safe assumption for a California-centric spot library.
export const DEFAULT_FACES = 270

/** Smallest angular distance between two compass bearings. */
function angDiff(a, b) {
  const d = Math.abs(((a - b) % 360 + 360) % 360)
  return d > 180 ? 360 - d : d
}

/**
 * Classify wind relative to the direction the beach faces.
 * Wind directions are "blowing FROM"; offshore wind comes from behind the
 * beach, i.e. from (faces + 180).
 */
export function windQuality(windDirection, faces = DEFAULT_FACES) {
  if (windDirection == null) return null
  const offshoreFrom = (faces + 180) % 360
  const d = angDiff(windDirection, offshoreFrom)
  if (d <= 45) return 'offshore'
  if (d <= 135) return 'cross'
  return 'onshore'
}

export const WIND_QUALITY_COLORS = {
  offshore: '#00FF88',
  cross: '#FFE600',
  onshore: '#FF2D78',
}

/** Surfer-speak size descriptor for a wave face height in feet. */
export function sizeDescriptor(ft) {
  if (ft == null) return null
  if (ft < 1) return 'ankle-high'
  if (ft < 2) return 'knee-high'
  if (ft < 3) return 'waist-high'
  if (ft < 4.5) return 'chest-high'
  if (ft < 6) return 'head-high'
  if (ft < 8) return 'overhead'
  if (ft < 12) return 'well overhead'
  return 'huge'
}

function swellCharacter(period) {
  if (period == null) return 'swell'
  if (period >= 13) return 'groundswell'
  if (period >= 10) return 'mid-period swell'
  return 'short-period windswell'
}

/** Average of the non-null values of `key` across hours, or null. */
function avg(hours, key) {
  const vals = hours.map(h => h[key]).filter(v => v != null)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

/** Representative wind for a block of hours: mean speed, mid-block direction. */
function windBlock(hours, faces) {
  if (!hours.length) return null
  const speed = avg(hours, 'windSpeed')
  if (speed == null) return null
  const mid = hours[Math.floor(hours.length / 2)]
  const direction = mid.windDirection
  return {
    speed: Math.round(speed),
    direction,
    compass: degreesToCompass(direction),
    quality: windQuality(direction, faces),
  }
}

/** Local extrema of the modeled tide curve → [{ time, type, height }]. */
export function findTideEvents(hours) {
  const pts = hours.filter(h => h.tide != null)
  const events = []
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1].tide, cur = pts[i].tide, next = pts[i + 1].tide
    if (cur > prev && cur >= next) events.push({ time: pts[i].time, type: 'high', height: cur })
    else if (cur < prev && cur <= next) events.push({ time: pts[i].time, type: 'low', height: cur })
  }
  return events
}

function rateDay({ maxFt, period, wind }) {
  if (maxFt == null || maxFt < 1) return 0
  let score = 0
  if (maxFt >= 4 && maxFt <= 8) score += 3
  else if (maxFt >= 2) score += 2
  else score += 1
  if (period != null) {
    if (period >= 14) score += 3
    else if (period >= 11) score += 2
    else if (period >= 8) score += 1
  }
  if (wind) {
    if (wind.quality === 'offshore' || wind.speed < 5) score += 2
    else if (wind.quality === 'cross' || wind.speed < 10) score += 1
    else if (wind.quality === 'onshore' && wind.speed > 15) score -= 2
  }
  if (score >= 7) return 4
  if (score >= 5) return 3
  if (score >= 3) return 2
  return 1
}

function buildSummary(c) {
  const parts = []

  if (c.range.max != null && c.range.max < 1) {
    parts.push('Pretty much flat — not worth the wax.')
  } else if (c.swell) {
    const size = sizeDescriptor(c.range.max)
    const range = c.range.min != null && c.range.max != null && c.range.min !== c.range.max
      ? `${c.range.min}–${c.range.max}ft`
      : `${c.range.max}ft`
    const period = c.swell.period != null ? ` @ ${Math.round(c.swell.period)}s` : ''
    parts.push(`${cap(size)} ${c.swell.compass} ${swellCharacter(c.swell.period)} (${range}${period}).`)
  }

  const am = c.wind?.am, pm = c.wind?.pm
  if (am && pm) {
    const amCalm = am.speed < 5 || am.quality === 'offshore'
    const pmCalm = pm.speed < 5 || pm.quality === 'offshore'
    if (amCalm && pmCalm) {
      parts.push('Light or offshore wind all day — clean conditions likely.')
    } else if (amCalm && !pmCalm) {
      parts.push(`${am.quality === 'offshore' ? `Offshore ${am.compass}` : 'Light'} wind in the morning turning ${pm.quality} ${pm.compass} ${pm.speed}mph by afternoon — surf it early.`)
    } else if (!amCalm && pmCalm) {
      parts.push(`${cap(am.quality)} ${am.compass} wind in the morning, backing off later — an evening glass-off is possible.`)
    } else if (am.quality === 'onshore' && am.speed >= 10) {
      parts.push(`Onshore ${am.compass} wind (${am.speed}mph+) most of the day — expect chop.`)
    } else {
      parts.push(`${cap(am.quality)} ${am.compass} wind around ${am.speed}mph through the day.`)
    }
  }

  const nextTides = c.tides.slice(0, 2)
  if (nextTides.length) {
    parts.push(
      nextTides
        .map(t => `${cap(t.type)} tide around ${hourLabel(t.time)}`)
        .join(', ') + '.',
    )
  }

  return parts.join(' ')
}

const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s)

/**
 * Analyze one forecast day (from fetchForecast's `days` array) for a spot.
 * Stats use the surfable window (6am–8pm); tide events use the whole day.
 */
export function analyzeDay(day, faces = DEFAULT_FACES) {
  const daylight = day.hours.filter(h => h.hourNum >= 6 && h.hourNum <= 20)
  const hours = daylight.length ? daylight : day.hours

  const heights = hours.map(h => h.waveHeight).filter(v => v != null)
  const range = heights.length
    ? { min: Math.round(Math.min(...heights) * 2) / 2, max: Math.round(Math.max(...heights) * 2) / 2 }
    : { min: null, max: null }

  // Dominant swell component at midday, by wave energy (height² · period).
  const midday = hours.find(h => h.hourNum === 12) ?? hours[Math.floor(hours.length / 2)]
  let swell = null
  if (midday?.swells?.length) {
    const best = [...midday.swells].sort(
      (a, b) => b.height * b.height * (b.period ?? 1) - a.height * a.height * (a.period ?? 1),
    )[0]
    swell = { ...best, compass: degreesToCompass(best.direction) }
  } else if (midday?.waveHeight != null) {
    swell = {
      height: midday.waveHeight,
      period: midday.wavePeriod,
      direction: midday.waveDirection,
      compass: degreesToCompass(midday.waveDirection),
    }
  }

  const wind = {
    am: windBlock(hours.filter(h => h.hourNum >= 6 && h.hourNum <= 11), faces),
    pm: windBlock(hours.filter(h => h.hourNum >= 12 && h.hourNum <= 18), faces),
  }

  const tides = findTideEvents(day.hours)
  const airHighs = hours.map(h => h.airTemp).filter(v => v != null)

  const conditions = {
    date: day.date,
    faces,
    range,
    swell,
    swells: midday?.swells ?? [],
    wind,
    tides,
    waterTemp: midday?.sst ?? null,
    airHigh: airHighs.length ? Math.max(...airHighs) : null,
    weatherCode: midday?.weatherCode ?? null,
    sunrise: day.sunrise,
    sunset: day.sunset,
    sunriseLabel: clockLabel(day.sunrise),
    sunsetLabel: clockLabel(day.sunset),
  }

  const rating = rateDay({ maxFt: range.max, period: swell?.period ?? null, wind: wind.am ?? wind.pm })

  return {
    ...conditions,
    rating,
    ratingLabel: RATING_LABELS[rating],
    ratingColor: RATING_COLORS[rating],
    summary: buildSummary(conditions),
  }
}
