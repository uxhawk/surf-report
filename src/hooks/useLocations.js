import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchLocations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name')
    setLocations(data ?? [])
    setError(error)
    setLoading(false)
  }

  useEffect(() => { fetchLocations() }, [])

  async function createLocation(location) {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single()
    if (!error) {
      setLocations(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
    return { data, error }
  }

  async function updateLocation(id, updates) {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      setLocations(prev => prev.map(l => l.id === id ? data : l))
    }
    return { data, error }
  }

  async function deleteLocation(id) {
    const { error } = await supabase.from('locations').delete().eq('id', id)
    if (!error) {
      setLocations(prev => prev.filter(l => l.id !== id))
    }
    return { error }
  }

  return { locations, loading, error, createLocation, updateLocation, deleteLocation, refresh: fetchLocations }
}
