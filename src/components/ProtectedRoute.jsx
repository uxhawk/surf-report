import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Spinner } from './ui/Spinner'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh bg-retro-bg flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return children
}
