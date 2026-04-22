import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { useLocations } from '../hooks/useLocations'
import { useBoards } from '../hooks/useBoards'
import { useFins } from '../hooks/useFins'
import { WAVE_SIZES } from '../lib/constants'
import { todayStr } from '../lib/utils'
import { fetchSwellData, degreesToCompass } from '../lib/openmeteo'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { Send } from 'pixelarticons/react/Send.js'
import { Angry } from 'pixelarticons/react/Angry.js'

function validate(form) {
  const errors = {}
  if (!form.date) errors.date = 'Date is required'
  if (!form.location_id) errors.location_id = 'Location is required'
  if (!form.board_id) errors.board_id = 'Board is required'
  if (!form.fins_id) errors.fins_id = 'Fins are required'
  if (!form.waves) errors.waves = 'Wave size is required'
  if (!form.notes.trim()) errors.notes = 'Notes are required'
  return errors
}

const LOCATION_BOARD_DEFAULTS = {
  'san onofre': 'rad nose rider',
}

function applyBoardDefaultToForm(next, boardId, activeBoards, activeFins) {
  const board = activeBoards.find(b => b.id === boardId)
  if (!board) {
    next.board_id = boardId
    next.fins_id = ''
    return
  }
  const matching = board.fin_configurations?.length
    ? activeFins.filter(f => board.fin_configurations.includes(f.setup))
    : activeFins
  next.board_id = boardId
  const defId = board.default_fins_id
  if (defId && matching.some(f => f.id === defId)) {
    next.fins_id = defId
  } else {
    next.fins_id = matching.length === 1 ? matching[0].id : ''
  }
}

function applyLocationGearDefaults(loc, next, activeBoards, activeFins) {
  if (!loc) return
  let applied = false
  if (loc.default_board_id) {
    const board = activeBoards.find(b => b.id === loc.default_board_id)
    if (board) {
      applyBoardDefaultToForm(next, board.id, activeBoards, activeFins)
      applied = true
    }
  }
  if (!applied) {
    const defaultModel = LOCATION_BOARD_DEFAULTS[loc.name.toLowerCase()]
    if (defaultModel) {
      const board = activeBoards.find(b => b.model.toLowerCase() === defaultModel)
      if (board) applyBoardDefaultToForm(next, board.id, activeBoards, activeFins)
    }
  }
}

export default function LogSurf() {
  const navigate = useNavigate()
  const showToast = useToast()
  const { createSession } = useSessions()
  const { locations, loading: locLoading } = useLocations()
  const { boards, loading: boardLoading } = useBoards()
  const { fins, loading: finsLoading } = useFins()

  const [form, setForm] = useState({
    date: todayStr(),
    location_id: '',
    board_id: '',
    fins_id: '',
    waves: '',
    notes: '',
    swell_height: null,
    swell_period: null,
    swell_direction: null,
    water_temp_c: null,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [swellLoading, setSwellLoading] = useState(false)
  const [swellError, setSwellError] = useState(null)

  const activeLocations = useMemo(() => locations.filter(l => !l.archived), [locations])
  const activeBoards = useMemo(() => boards.filter(b => !b.archived), [boards])
  const activeFins = useMemo(() => fins.filter(f => !f.archived), [fins])

  useEffect(() => {
    if (!activeLocations.length || form.location_id) return
    const oceanside = activeLocations.find(l => l.name.toLowerCase() === 'oceanside')
    if (!oceanside) return
    setForm(prev => {
      if (prev.location_id) return prev
      const next = { ...prev, location_id: oceanside.id }
      applyLocationGearDefaults(oceanside, next, activeBoards, activeFins)
      return next
    })
  }, [activeLocations, activeBoards, activeFins, form.location_id])

  useEffect(() => {
    if (!form.date || !form.location_id) return
    const loc = locations.find(l => l.id === form.location_id)
    if (!loc?.latitude || !loc?.longitude) {
      setSwellError(null)
      setForm(prev => ({ ...prev, swell_height: null, swell_period: null, swell_direction: null, water_temp_c: null }))
      return
    }

    let cancelled = false
    setSwellLoading(true)
    setSwellError(null)

    fetchSwellData(loc.latitude, loc.longitude, form.date)
      .then(data => {
        if (cancelled) return
        if (data) {
          setForm(prev => ({
            ...prev,
            swell_height: data.swellHeight,
            swell_period: data.swellPeriod,
            swell_direction: data.swellDirection,
            water_temp_c: data.waterTempC,
          }))
        } else {
          setSwellError('No swell data available for this date.')
          setForm(prev => ({ ...prev, swell_height: null, swell_period: null, swell_direction: null, water_temp_c: null }))
        }
      })
      .catch(() => {
        if (!cancelled) setSwellError('Could not fetch swell data.')
      })
      .finally(() => { if (!cancelled) setSwellLoading(false) })

    return () => { cancelled = true }
  }, [form.date, form.location_id, locations])

  // Filter fins to match the selected board's fin configurations
  const availableFins = useMemo(() => {
    const board = activeBoards.find(b => b.id === form.board_id)
    if (!board?.fin_configurations?.length) return activeFins
    return activeFins.filter(f => board.fin_configurations.includes(f.setup))
  }, [form.board_id, activeBoards, activeFins])

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'location_id') {
        const loc = activeLocations.find(l => l.id === value)
        applyLocationGearDefaults(loc, next, activeBoards, activeFins)
      }
      if (field === 'board_id') {
        applyBoardDefaultToForm(next, value, activeBoards, activeFins)
      }
      return next
    })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    const { error } = await createSession(form)
    setSubmitting(false)

    if (error) {
      setSubmitError(error.message)
      return
    }

    showToast('Session logged!')
    navigate('/')
  }

  const loading = locLoading || boardLoading || finsLoading
  if (loading) return <Spinner />

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        <FormField label="Date" required error={errors.date}>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            max={todayStr()}
          />
        </FormField>

        <FormField label="Location" required error={errors.location_id}>
          {activeLocations.length === 0 ? (
            <p className="text-neon-pink text-xs py-2">
              No locations yet — add them in Gear → Locations bro
            </p>
          ) : (
            <select value={form.location_id} onChange={e => set('location_id', e.target.value)}>
              <option value="">Select location…</option>
              {activeLocations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Board" required error={errors.board_id}>
          {activeBoards.length === 0 ? (
            <p className="text-neon-pink text-xs py-2">
              No boards yet — add them in Gear → Boards first.
            </p>
          ) : (
            <select value={form.board_id} onChange={e => set('board_id', e.target.value)}>
              <option value="">Select board…</option>
              {activeBoards.map(b => (
                <option key={b.id} value={b.id}>{b.model}</option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          label="Fins"
          required
          error={errors.fins_id}
          hint={form.board_id && availableFins.length === 0 ? 'No fins match this board\'s setup. Add matching fins in Gear → Fins.' : undefined}
        >
          {activeFins.length === 0 ? (
            <p className="text-neon-pink text-xs py-2">
              No fins yet — add them in Gear → Fins first.
            </p>
          ) : (
            <select
              value={form.fins_id}
              onChange={e => set('fins_id', e.target.value)}
              disabled={!form.board_id}
            >
              <option value="">
                {form.board_id ? 'Select fins…' : 'Select a board first…'}
              </option>
              {availableFins.map(f => (
                <option key={f.id} value={f.id}>{f.model} ({f.setup})</option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Wave Size" required error={errors.waves}>
          <select value={form.waves} onChange={e => set('waves', e.target.value)}>
            <option value="">Select wave size…</option>
            {WAVE_SIZES.map(s => (
              <option key={s} value={s}>{s} ft</option>
            ))}
          </select>
        </FormField>

        {(swellLoading || form.swell_height != null || swellError) && (
          <div className="gradient-border rounded-xl p-4 bg-retro-surface flex flex-col gap-2">
            <h3 className="text-neon-cyan font-display text-[9px] uppercase">Ocean Conditions</h3>
            {swellLoading ? (
              <p className="text-retro-muted text-xs animate-pulse">Fetching ocean data…</p>
            ) : swellError ? (
              <p className="text-retro-muted text-xs">{swellError}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-retro-muted text-[10px] uppercase">Height</p>
                  <p className="text-white text-sm font-semibold">{form.swell_height != null ? `${form.swell_height} ft` : '—'}</p>
                </div>
                <div>
                  <p className="text-retro-muted text-[10px] uppercase">Period</p>
                  <p className="text-white text-sm font-semibold">{form.swell_period != null ? `${form.swell_period}s` : '—'}</p>
                </div>
                <div>
                  <p className="text-retro-muted text-[10px] uppercase">Direction</p>
                  <p className="text-white text-sm font-semibold">{form.swell_direction != null ? `${degreesToCompass(form.swell_direction)} (${Math.round(form.swell_direction)}°)` : '—'}</p>
                </div>
                <div>
                  <p className="text-retro-muted text-[10px] uppercase">Water Temp</p>
                  <p className="text-white text-sm font-semibold">{form.water_temp_c != null ? `${Math.round(form.water_temp_c * 9 / 5 + 32)}°F` : '—'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <FormField label="Notes" required error={errors.notes}>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="How were the conditions? What worked? What didn't?"
            rows={4}
          />
        </FormField>

        {submitError && (
          <p className="text-neon-pink text-sm bg-neon-pink/10 border border-neon-pink/30 rounded-lg p-3">
            {submitError}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            <Angry className="w-4 h-4" /> Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : <><Send className="w-4 h-4" /> Log Session</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
