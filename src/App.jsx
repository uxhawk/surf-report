import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import LogSurf from './pages/LogSurf'
import EditSession from './pages/EditSession'
import GearLayout from './pages/GearLayout'
import LocationsPage from './pages/LocationsPage'
import BoardsPage from './pages/BoardsPage'
import FinsPage from './pages/FinsPage'
import GearMetrics from './pages/GearMetrics'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/log" element={<LogSurf />} />
                      <Route path="/sessions/:id/edit" element={<EditSession />} />
                      <Route path="/profile/boards/:id/metrics" element={<GearMetrics type="board" />} />
                      <Route path="/profile/fins/:id/metrics" element={<GearMetrics type="fin" />} />
                      <Route path="/profile/locations/:id/metrics" element={<GearMetrics type="location" />} />
                      <Route path="/profile" element={<GearLayout />}>
                        <Route index element={<Navigate to="locations" replace />} />
                        <Route path="locations" element={<LocationsPage />} />
                        <Route path="boards" element={<BoardsPage />} />
                        <Route path="fins" element={<FinsPage />} />
                      </Route>
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}
