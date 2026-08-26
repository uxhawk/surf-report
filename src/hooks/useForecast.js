import { useState, useEffect } from 'react'
import { fetchForecast } from '../lib/forecast'

export function useForecast(latitude, longitude) {
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(latitude != null && longitude != null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (latitude == null || longitude == null) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchForecast(latitude, longitude)
        if (!cancelled) setForecast(data)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [latitude, longitude])

  return { forecast, loading, error }
}
