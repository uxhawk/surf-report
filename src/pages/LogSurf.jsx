import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { useLocations } from '../hooks/useLocations'
import { useBoards } from '../hooks/useBoards'
import { useFins } from '../hooks/useFins'
import { WAVE_SIZES } from '../lib/constants'
import { todayStr } from '../lib/utils'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

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

export default function LogSurf() {
  const navigate = useNavigate()
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
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const activeBoards = useMemo(() => boards.filter(b => !b.archived), [boards])
  const activeFins = useMemo(() => fins.filter(f => !f.archived), [fins])

  // Filter fins to match the selected board's fin configurations
  const availableFins = useMemo(() => {
    const board = activeBoards.find(b => b.id === form.board_id)
    if (!board?.fin_configurations?.length) return activeFins
    return activeFins.filter(f => board.fin_configurations.includes(f.setup))
  }, [form.board_id, activeBoards, activeFins])

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      // Clear fins selection if board changes (fins may no longer be compatible)
      if (field === 'board_id') next.fins_id = ''
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
          {locations.length === 0 ? (
            <p className="text-neon-pink text-xs py-2">
              No locations yet — add them in Gear → Locations bro
            </p>
          ) : (
            <select value={form.location_id} onChange={e => set('location_id', e.target.value)}>
              <option value="">Select location…</option>
              {locations.map(l => (
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
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Log Session'}
          </Button>
        </div>
      </form>
    </div>
  )
}
