const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine'

/**
 * Geocode a place name using Nominatim (OpenStreetMap).
 * Knows beaches, points, reefs, and named natural features — not just cities.
 * Rate limit: 1 req/sec (enforced by the 350ms debounce in the UI).
 */
export async function geocodeLocation(name, limit = 8) {
  const params = new URLSearchParams({
    q: name.trim(),
    format: 'jsonv2',
    limit,
    'accept-language': 'en',
  })
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'SurfTracker/1.0' },
  })
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`)
  const json = await res.json()
  return json.map(r => ({
    name: r.name || r.display_name.split(',')[0],
    displayName: r.display_name,
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
    type: r.type ?? '',
  }))
}

/**
 * Fetch daily marine/swell data for a given location and date from Open-Meteo.
 * Returns { swellHeight, swellPeriod, swellDirection } or null if unavailable.
 * Heights are converted from meters to feet.
 */
export async function fetchSwellData(latitude, longitude, date) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    daily: 'wave_height_max,wave_period_max,wave_direction_dominant',
    hourly: 'sea_surface_temperature',
    start_date: date,
    end_date: date,
    timezone: 'auto',
  })
  const res = await fetch(`${MARINE_URL}?${params}`)
  if (!res.ok) throw new Error(`Marine API failed: ${res.status}`)
  const json = await res.json()

  const daily = json.daily
  if (!daily?.wave_height_max?.[0] && daily?.wave_height_max?.[0] !== 0) return null

  const metersToFeet = 3.28084

  // Prefer midday SST, fall back to the latest available reading for the day
  const sst = json.hourly?.sea_surface_temperature ?? []
  let middayTemp = sst[12] ?? null
  if (middayTemp == null) {
    for (let i = sst.length - 1; i >= 0; i--) {
      if (sst[i] != null) { middayTemp = sst[i]; break }
    }
  }

  return {
    swellHeight: daily.wave_height_max[0] != null
      ? Math.round(daily.wave_height_max[0] * metersToFeet * 10) / 10
      : null,
    swellPeriod: daily.wave_period_max[0] ?? null,
    swellDirection: daily.wave_direction_dominant[0] ?? null,
    waterTempC: middayTemp != null ? Math.round(middayTemp * 10) / 10 : null,
  }
}

const COMPASS_DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

export function degreesToCompass(deg) {
  if (deg == null || isNaN(deg)) return '—'
  const idx = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16
  return COMPASS_DIRS[idx]
}
