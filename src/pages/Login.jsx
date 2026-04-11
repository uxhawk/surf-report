import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

const VIEWS = { SIGN_IN: 'sign_in', SIGN_UP: 'sign_up', FORGOT: 'forgot' }

export default function Login() {
  const { session, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth()
  const [view, setView] = useState(VIEWS.SIGN_IN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [signUpSent, setSignUpSent] = useState(false)
  const [emailExists, setEmailExists] = useState(false)

  function clearState() {
    setError(null)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
    setSignUpSent(false)
    setEmailExists(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    try {
      if (view === VIEWS.FORGOT) {
        const { error } = await resetPassword(email)
        if (error) throw error
        setMessage('Check your email for a password reset link.')
        return
      }

      if (view === VIEWS.SIGN_UP) {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.')
          return
        }
        const { data, error } = await signUpWithEmail(email, password)
        if (error) throw error
        if (data?.user?.identities?.length === 0) {
          setEmailExists(true)
          return
        }
        setSignUpSent(true)
        return
      }

      const { error } = await signInWithEmail(email, password)
      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  const title = {
    [VIEWS.SIGN_IN]: 'Sign In',
    [VIEWS.SIGN_UP]: 'Create Account',
    [VIEWS.FORGOT]: 'Reset Password',
  }[view]

  if (loading) {
    return (
      <div className="min-h-dvh bg-retro-bg flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (session) return <Navigate to="/" replace />

  return (
    <div className="min-h-dvh bg-retro-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* App branding */}
        <div className="text-center">
          <h1 className="font-display text-neon-yellow text-xs mb-2">🏄 Surf Tracker</h1>
          <p className="text-retro-muted text-sm">{title}</p>
        </div>

        {/* Sign-up success state */}
        {signUpSent && (
          <div className="text-center flex flex-col gap-4">
            <p className="text-4xl">📬</p>
            <p className="text-white text-sm">
              We sent a confirmation link to <span className="text-neon-cyan font-medium">{email}</span>.
              Check your inbox and tap the link to activate your account.
            </p>
            <p className="text-retro-muted text-xs">
              Don&apos;t see it? Check your spam folder.
            </p>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => { setView(VIEWS.SIGN_IN); clearState() }}
            >
              Back to sign in
            </Button>
          </div>
        )}

        {/* Email already exists state */}
        {emailExists && (
          <div className="text-center flex flex-col gap-4">
            <p className="text-4xl">🤙</p>
            <p className="text-white text-sm">
              Looks like <span className="text-neon-cyan font-medium">{email}</span> already has an account.
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => { setView(VIEWS.SIGN_IN); clearState() }}
            >
              Sign in instead
            </Button>
          </div>
        )}

        {/* Main form (hidden after successful signup or email-exists) */}
        {!signUpSent && !emailExists && (
          <>
            {/* Google OAuth */}
            {view !== VIEWS.FORGOT && (
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
                           bg-white text-gray-800 font-medium text-sm
                           hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58Z" />
                </svg>
                Continue with Google
              </button>
            )}

            {/* Divider */}
            {view !== VIEWS.FORGOT && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-retro-border" />
                <span className="text-retro-muted text-xs">or</span>
                <div className="flex-1 h-px bg-retro-border" />
              </div>
            )}

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-xs text-retro-muted mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              {view !== VIEWS.FORGOT && (
                <div>
                  <label htmlFor="password" className="block text-xs text-retro-muted mb-1.5">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete={view === VIEWS.SIGN_UP ? 'new-password' : 'current-password'}
                    placeholder="••••••••"
                  />
                </div>
              )}

              {view === VIEWS.SIGN_UP && (
                <div>
                  <label htmlFor="confirm-password" className="block text-xs text-retro-muted mb-1.5">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && (
                <p className="text-neon-pink text-sm">{error}</p>
              )}

              {message && (
                <p className="text-neon-green text-sm">{message}</p>
              )}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Spinner className="!py-0 [&>div]:w-5 [&>div]:h-5" /> : title}
              </Button>
            </form>

            {/* View toggles */}
            <div className="text-center text-sm text-retro-muted space-y-2">
              {view === VIEWS.SIGN_IN && (
                <>
                  <button
                    type="button"
                    onClick={() => { setView(VIEWS.FORGOT); clearState() }}
                    className="block w-full text-neon-cyan hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setView(VIEWS.SIGN_UP); clearState() }}
                      className="text-neon-cyan hover:underline cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                </>
              )}

              {view === VIEWS.SIGN_UP && (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setView(VIEWS.SIGN_IN); clearState() }}
                    className="text-neon-cyan hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}

              {view === VIEWS.FORGOT && (
                <button
                  type="button"
                  onClick={() => { setView(VIEWS.SIGN_IN); clearState() }}
                  className="text-neon-cyan hover:underline cursor-pointer"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
