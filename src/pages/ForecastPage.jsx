import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocations } from '../hooks/useLocations'
import { geocodeLocation } from '../lib/openmeteo'
import { SURF_REGIONS } from '../lib/surfSpots'
import { SpotForecastCard } from '../components/forecast/SpotForecastCard'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { ChevronDown } from 'pixelarticons/react/ChevronDown.js'
import { ChevronUp } from 'pixelarticons/react/ChevronUp.js'
import { MapPin } from 'pixelarticons/react/MapPin.js'

export default function ForecastPage() {
  const navigate = useNavigate()
  const { locations, loading } = useLocations()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [openRegion, setOpenRegion] = useState(null)
  const debounceRef = useRef(null)
  const requestRef = useRef(0)

  function openDetail({ name, latitude, longitude, faces, spotId }) {
    const params = new URLSearchParams({
      lat: latitude,
      lng: longitude,
      name,
    })
    if (faces != null) params.set('faces', faces)
    if (spotId) params.set('spotId', spotId)
    navigate(`/home/forecast/spot?${params}`, { state: { name } })
  }

  function handleSearch(value) {
    setQuery(value)
    setSearchError(null)
    clearTimeout(debounceRef.current)
    if (!value.trim() || value.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      const reqId = ++requestRef.current
      setSearching(true)
      try {
        const found = await geocodeLocation(value)
        if (reqId !== requestRef.current) return
        setResults(found)
        if (found.length === 0) setSearchError('No spot found. Try a nearby city or more specific name.')
      } catch {
        if (reqId !== requestRef.current) return
        setSearchError('Could not search right now.')
        setResults([])
      } finally {
        if (reqId === requestRef.current) setSearching(false)
      }
    }, 350)
  }

  if (loading) return <Spinner />

  const spots = locations.filter(l => !l.archived && l.latitude != null && l.longitude != null)
  const missingCoords = locations.filter(l => !l.archived && (l.latitude == null || l.longitude == null))

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Saved spots */}
      <section>
        <h2 className="text-neon-yellow font-display text-[9px] uppercase mb-3">My Spots</h2>
        {spots.length === 0 ? (
          <EmptyState
            icon="📍"
            title="No spots with coordinates"
            message="Add coordinates to your spots (Spots tab → edit → location search) to see their forecasts here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {spots.map(spot => (
              <SpotForecastCard
                key={spot.id}
                name={spot.name}
                latitude={spot.latitude}
                longitude={spot.longitude}
                faces={spot.faces_degrees ?? undefined}
                onClick={() => openDetail({
                  name: spot.name,
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                  faces: spot.faces_degrees,
                  spotId: spot.id,
                })}
              />
            ))}
          </div>
        )}
        {missingCoords.length > 0 && spots.length > 0 && (
          <p className="text-retro-muted/60 text-[10px] mt-2">
            {missingCoords.length} spot{missingCoords.length > 1 ? 's' : ''} hidden — no coordinates set.
          </p>
        )}
      </section>

      {/* Explore */}
      <section>
        <h2 className="text-neon-yellow font-display text-[9px] uppercase mb-3">Explore</h2>

        <div className="relative mb-3">
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search any spot… e.g. Uluwatu, Pipeline"
            autoComplete="off"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-retro-muted text-xs animate-pulse">
              searching…
            </span>
          )}
          {results.length > 0 && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 rounded-lg border border-retro-border bg-retro-surface shadow-lg max-h-60 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setResults([])
                    openDetail({ name: r.name, latitude: r.latitude, longitude: r.longitude })
                  }}
                  className="w-full text-left px-3 py-2.5 flex flex-col gap-0.5 hover:bg-neon-cyan/10 transition-colors border-b border-retro-border last:border-b-0"
                >
                  <span className="text-white text-sm">{r.name}</span>
                  <span className="text-retro-muted text-xs leading-snug">{r.displayName}</span>
                </button>
              ))}
            </div>
          )}
          {searchError && results.length === 0 && (
            <p className="text-neon-pink text-xs mt-1">{searchError}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {SURF_REGIONS.map(region => {
            const open = openRegion === region.name
            return (
              <div key={region.name} className="gradient-border rounded-xl bg-retro-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenRegion(open ? null : region.name)}
                  className="w-full flex items-center justify-between px-4 py-3"
                  aria-expanded={open}
                >
                  <span className="text-white font-display text-[10px]">{region.name}</span>
                  {open
                    ? <ChevronUp className="w-4 h-4 text-retro-muted" />
                    : <ChevronDown className="w-4 h-4 text-retro-muted" />}
                </button>
                {open && (
                  <div className="border-t border-retro-border">
                    {region.spots.map(spot => (
                      <button
                        key={spot.name}
                        type="button"
                        onClick={() => openDetail(spot)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-neon-cyan/10 transition-colors border-b border-retro-border last:border-b-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-retro-muted shrink-0" />
                        <span className="text-white text-sm">{spot.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
