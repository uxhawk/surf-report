import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SESSION_QUERY = `
  id,
  date,
  waves,
  notes,
  swell_height,
  swell_period,
  swell_direction,
  water_temp_c,
  created_at,
  location:locations(id, name, latitude, longitude),
  board:boards(id, brand, model, length_inches),
  fins:fins(id, brand, model, setup)
`

export function useSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchSessions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select(SESSION_QUERY)
      .order('date', { ascending: false })
    setSessions(data ?? [])
    setError(error)
    setLoading(false)
  }

  useEffect(() => { fetchSessions() }, [])

  async function createSession(session) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select(SESSION_QUERY)
      .single()
    if (!error) {
      setSessions(prev => [data, ...prev])
    }
    return { data, error }
  }

  async function updateSession(id, updates) {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select(SESSION_QUERY)
      .single()
    if (!error) {
      setSessions(prev => prev.map(s => s.id === id ? data : s))
    }
    return { data, error }
  }

  async function deleteSession(id) {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== id))
    }
    return { error }
  }

  async function getSession(id) {
    const { data, error } = await supabase
      .from('sessions')
      .select(SESSION_QUERY)
      .eq('id', id)
      .single()
    return { data, error }
  }

  return { sessions, loading, error, createSession, updateSession, deleteSession, getSession, refresh: fetchSessions }
}
