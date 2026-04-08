import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFins() {
  const [fins, setFins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchFins() {
    setLoading(true)
    const { data, error } = await supabase
      .from('fins')
      .select('*')
      .order('brand')
    setFins(data ?? [])
    setError(error)
    setLoading(false)
  }

  useEffect(() => { fetchFins() }, [])

  async function createFin(fin) {
    const { data, error } = await supabase
      .from('fins')
      .insert(fin)
      .select()
      .single()
    if (!error) {
      setFins(prev => [...prev, data].sort((a, b) => a.brand.localeCompare(b.brand)))
    }
    return { data, error }
  }

  async function updateFin(id, updates) {
    const { data, error } = await supabase
      .from('fins')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      setFins(prev => prev.map(f => f.id === id ? data : f))
    }
    return { data, error }
  }

  async function deleteFin(id) {
    const { error } = await supabase.from('fins').delete().eq('id', id)
    if (!error) {
      setFins(prev => prev.filter(f => f.id !== id))
    }
    return { error }
  }

  return { fins, loading, error, createFin, updateFin, deleteFin, refresh: fetchFins }
}
