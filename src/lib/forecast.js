const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

const M_TO_FT = 3.28084
const FORECAST_DAYS = 7
const CACHE_TTL_MS = 30 * 60 * 1000

const toFt = m => (m != null ? Math.round(m * M_TO_FT * 10) / 10 : null)
const toF = c => (c != null ? Math.round((c * 9) / 5 + 32) : null)

// Cache stores in-flight promises so the list view and detail view
// share one request per spot instead of double-fetching.
const cache = new Map()

/**
 * Fetch a merged 7-day marine + weather forecast for a point.
 * Marine (waves, swell components, SST, modeled tide) and weather
 * (wind, air temp, sunrise/sunset) come from separate Open-Meteo APIs
 * and are merged by timestamp. Heights in feet, temps in °F, wind in mph.
 */
export function fetchForecast(latitude, longitude) {
  const key = `${Number(latitude).toFixed(3)},${Number(longitude).toFixed(3)}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.promise

  const promise = fetchForecastUncached(latitude, longitude)
  cache.set(key, { at: Date.now(), promise })
  promise.catch(() => cache.delete(key))
  return promise
}

async function fetchForecastUncached(latitude, longitude) {
  const marineParams = new URLSearchParams({
    latitude,
    longitude,
    hourly: [
      'wave_height', 'wave_period', 'wave_direction',
      'swell_wave_height', 'swell_wave_period', 'swell_wave_direction',
      'secondary_swell_wave_height', 'secondary_swell_wave_period', 'secondary_swell_wave_direction',
      'wind_wave_height', 'wind_wave_period', 'wind_wave_direction',
      'sea_surface_temperature', 'sea_level_height_msl',
    ].join(','),
    forecast_days: FORECAST_DAYS,
    timezone: 'auto',
  })
  const weatherParams = new URLSearchParams({
    latitude,
    longitude,
    hourly: 'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code',
    daily: 'sunrise,sunset',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    forecast_days: FORECAST_DAYS,
    timezone: 'auto',
  })

  const [marineRes, weatherRes] = await Promise.all([
    fetch(`${MARINE_URL}?${marineParams}`),
    fetch(`${WEATHER_URL}?${weatherParams}`),
  ])
  if (!marineRes.ok) throw new Error(`Marine API failed: ${marineRes.status}`)
  if (!weatherRes.ok) throw new Error(`Weather API failed: ${weatherRes.status}`)
  const [marine, weather] = await Promise.all([marineRes.json(), weatherRes.json()])

  // Index weather rows by timestamp; the two APIs use the same local-time grid
  // but merging by time guards against any length mismatch.
  const wh = weather.hourly ?? {}
  const weatherByTime = new Map()
  ;(wh.time ?? []).forEach((t, i) => {
    weatherByTime.set(t, {
      airTemp: wh.temperature_2m?.[i] ?? null,
      windSpeed: wh.wind_speed_10m?.[i] != null ? Math.round(wh.wind_speed_10m[i]) : null,
      windGusts: wh.wind_gusts_10m?.[i] != null ? Math.round(wh.wind_gusts_10m[i]) : null,
      windDirection: wh.wind_direction_10m?.[i] ?? null,
      weatherCode: wh.weather_code?.[i] ?? null,
    })
  })

  const mh = marine.hourly ?? {}
  const hours = (mh.time ?? []).map((t, i) => {
    const w = weatherByTime.get(t) ?? {}
    const swells = [
      { key: 'primary', label: 'Primary swell', height: toFt(mh.swell_wave_height?.[i]), period: mh.swell_wave_period?.[i] ?? null, direction: mh.swell_wave_direction?.[i] ?? null },
      { key: 'secondary', label: 'Secondary swell', height: toFt(mh.secondary_swell_wave_height?.[i]), period: mh.secondary_swell_wave_period?.[i] ?? null, direction: mh.secondary_swell_wave_direction?.[i] ?? null },
      { key: 'windwave', label: 'Wind waves', height: toFt(mh.wind_wave_height?.[i]), period: mh.wind_wave_period?.[i] ?? null, direction: mh.wind_wave_direction?.[i] ?? null },
    ].filter(s => s.height != null && s.height >= 0.2)
    return {
      time: t,
      date: t.slice(0, 10),
      hourNum: Number(t.slice(11, 13)),
      waveHeight: toFt(mh.wave_height?.[i]),
      wavePeriod: mh.wave_period?.[i] ?? null,
      waveDirection: mh.wave_direction?.[i] ?? null,
      swells,
      sst: toF(mh.sea_surface_temperature?.[i]),
      tide: toFt(mh.sea_level_height_msl?.[i]),
      airTemp: w.airTemp != null ? Math.round(w.airTemp) : null,
      windSpeed: w.windSpeed ?? null,
      windGusts: w.windGusts ?? null,
      windDirection: w.windDirection ?? null,
      weatherCode: w.weatherCode ?? null,
    }
  })

  const wd = weather.daily ?? {}
  const sunByDate = new Map()
  ;(wd.time ?? []).forEach((d, i) => {
    sunByDate.set(d, { sunrise: wd.sunrise?.[i] ?? null, sunset: wd.sunset?.[i] ?? null })
  })

  const days = []
  for (const h of hours) {
    let day = days[days.length - 1]
    if (!day || day.date !== h.date) {
      const sun = sunByDate.get(h.date) ?? {}
      day = { date: h.date, sunrise: sun.sunrise ?? null, sunset: sun.sunset ?? null, hours: [] }
      days.push(day)
    }
    day.hours.push(h)
  }

  return { fetchedAt: Date.now(), hours, days }
}

/** WMO weather code → short label + emoji, condensed for a mobile strip. */
export function weatherCodeInfo(code) {
  if (code == null) return { label: '—', emoji: '' }
  if (code === 0) return { label: 'Clear', emoji: '☀️' }
  if (code <= 2) return { label: 'Partly cloudy', emoji: '⛅' }
  if (code === 3) return { label: 'Overcast', emoji: '☁️' }
  if (code <= 48) return { label: 'Fog', emoji: '🌫️' }
  if (code <= 57) return { label: 'Drizzle', emoji: '🌦️' }
  if (code <= 67) return { label: 'Rain', emoji: '🌧️' }
  if (code <= 77) return { label: 'Snow', emoji: '🌨️' }
  if (code <= 82) return { label: 'Showers', emoji: '🌧️' }
  if (code <= 86) return { label: 'Snow showers', emoji: '🌨️' }
  return { label: 'Thunderstorm', emoji: '⛈️' }
}

/** '2026-08-26T06:00' or hour number → compact label like '6a' / '12p'. */
export function hourLabel(hourOrTime) {
  const h = typeof hourOrTime === 'number' ? hourOrTime : Number(String(hourOrTime).slice(11, 13))
  if (h === 0) return '12a'
  if (h < 12) return `${h}a`
  if (h === 12) return '12p'
  return `${h - 12}p`
}

/** ISO local time → '6:32am' (used for sunrise/sunset and tide events). */
export function clockLabel(isoTime) {
  if (!isoTime) return '—'
  const h = Number(isoTime.slice(11, 13))
  const m = isoTime.slice(14, 16)
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m}${h < 12 ? 'am' : 'pm'}`
}

/** '2026-08-28' → 'Fri 8/28' (or 'Today' for the current date). */
export function dayLabel(dateStr, { short = false } = {}) {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  if (dateStr === todayStr) return 'Today'
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  return short ? weekday : `${weekday} ${m}/${d}`
}
