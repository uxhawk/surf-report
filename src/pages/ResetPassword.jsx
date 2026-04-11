import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-retro-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="font-display text-neon-yellow text-xs mb-2">🏄 Surf Tracker</h1>
          <p className="text-retro-muted text-sm">Set New Password</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="new-password" className="block text-xs text-retro-muted mb-1.5">New Password</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-xs text-retro-muted mb-1.5">Confirm Password</label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-neon-pink text-sm">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? <Spinner className="!py-0 [&>div]:w-5 [&>div]:h-5" /> : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
