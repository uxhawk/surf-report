import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Load env vars from .env.local
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
)

// Use service role key to bypass RLS (no user auth needed)
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(env.VITE_SUPABASE_URL, supabaseKey)

const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine'
const METERS_TO_FEET = 3.28084

async function fetchSwellData(latitude, longitude, date) {
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
  if (!res.ok) throw new Error(`Marine API ${res.status}`)
  const json = await res.json()

  const daily = json.daily
  if (!daily?.wave_height_max?.[0] && daily?.wave_height_max?.[0] !== 0) return null

  const sst = json.hourly?.sea_surface_temperature ?? []
  let waterTemp = sst[12] ?? null
  if (waterTemp == null) {
    for (let i = sst.length - 1; i >= 0; i--) {
      if (sst[i] != null) { waterTemp = sst[i]; break }
    }
  }

  return {
    swell_height: daily.wave_height_max[0] != null
      ? Math.round(daily.wave_height_max[0] * METERS_TO_FEET * 10) / 10
      : null,
    swell_period: daily.wave_period_max[0] ?? null,
    swell_direction: daily.wave_direction_dominant[0] ?? null,
    water_temp_c: waterTemp != null ? Math.round(waterTemp * 10) / 10 : null,
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Add SUPABASE_SERVICE_ROLE_KEY to .env.local (find it in Supabase Dashboard → Project Settings → API)')
    process.exit(1)
  }
  console.log('Using service role key (bypasses RLS)')

  // Fetch all sessions with location data (including types)
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, date, swell_height, water_temp_c, location:locations(id, name, latitude, longitude, types)')
    .order('date', { ascending: true })

  if (error) { console.error('Failed to fetch sessions:', error.message); process.exit(1) }

  // Filter: skip sessions where location has "Wave Pool" type, or has no coordinates
  const eligible = sessions.filter(s => {
    if (!s.location?.latitude || !s.location?.longitude) return false
    if (s.location.types?.includes('Wave Pool')) return false
    return true
  })

  // Only backfill sessions missing swell or water temp data
  const needsBackfill = eligible.filter(s => s.swell_height == null || s.water_temp_c == null)

  console.log(`Total sessions: ${sessions.length}`)
  console.log(`Eligible (has coords, not wave pool): ${eligible.length}`)
  console.log(`Need backfill: ${needsBackfill.length}`)

  if (needsBackfill.length === 0) {
    console.log('Nothing to backfill!')
    return
  }

  let updated = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < needsBackfill.length; i++) {
    const s = needsBackfill[i]
    const loc = s.location
    const label = `[${i + 1}/${needsBackfill.length}] ${s.date} @ ${loc.name}`

    try {
      const data = await fetchSwellData(loc.latitude, loc.longitude, s.date)
      if (!data) {
        console.log(`${label} — no data available, skipping`)
        skipped++
      } else {
        const { error: updateErr } = await supabase
          .from('sessions')
          .update(data)
          .eq('id', s.id)
        if (updateErr) {
          console.log(`${label} — update failed: ${updateErr.message}`)
          failed++
        } else {
          console.log(`${label} — ${data.swell_height}ft, ${data.swell_period}s, ${data.swell_direction}°, ${data.water_temp_c}°C`)
          updated++
        }
      }
    } catch (err) {
      console.log(`${label} — API error: ${err.message}`)
      failed++
    }

    // Rate limit: ~2 requests/sec to be kind to the free API
    if (i < needsBackfill.length - 1) await sleep(500)
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`)
}

main().catch(err => { console.error(err); process.exit(1) })
