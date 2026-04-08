import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useBoards() {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchBoards() {
    setLoading(true)
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('brand')
    setBoards(data ?? [])
    setError(error)
    setLoading(false)
  }

  useEffect(() => { fetchBoards() }, [])

  async function createBoard(board) {
    const { data, error } = await supabase
      .from('boards')
      .insert(board)
      .select()
      .single()
    if (!error) {
      setBoards(prev => [...prev, data].sort((a, b) => a.brand.localeCompare(b.brand)))
    }
    return { data, error }
  }

  async function updateBoard(id, updates) {
    const { data, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      setBoards(prev => prev.map(b => b.id === id ? data : b))
    }
    return { data, error }
  }

  async function deleteBoard(id) {
    const { error } = await supabase.from('boards').delete().eq('id', id)
    if (!error) {
      setBoards(prev => prev.filter(b => b.id !== id))
    }
    return { error }
  }

  return { boards, loading, error, createBoard, updateBoard, deleteBoard, refresh: fetchBoards }
}
