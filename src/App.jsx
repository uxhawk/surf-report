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
import QuiverLayout from './pages/QuiverLayout'
import LocationsPage from './pages/LocationsPage'
import BoardsPage from './pages/BoardsPage'
import FinsPage from './pages/FinsPage'
import GearMetrics from './pages/GearMetrics'
import YouPage from './pages/YouPage'

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
                      <Route path="/" element={<Navigate to="/home" replace />} />
                      <Route path="/home" element={<Dashboard />} />
                      <Route path="/log" element={<LogSurf />} />
                      <Route path="/sessions/:id/edit" element={<EditSession />} />
                      <Route path="/spots" element={<LocationsPage />} />
                      <Route path="/spots/:id/metrics" element={<GearMetrics type="location" />} />
                      {/* Legacy redirects */}
                      <Route path="/locations" element={<Navigate to="/spots" replace />} />
                      <Route path="/locations/:id/metrics" element={<Navigate to="/spots" replace />} />
                      <Route path="/quiver" element={<QuiverLayout />}>
                        <Route index element={<Navigate to="boards" replace />} />
                        <Route path="boards" element={<BoardsPage />} />
                        <Route path="fins" element={<FinsPage />} />
                      </Route>
                      <Route path="/quiver/boards/:id/metrics" element={<GearMetrics type="board" />} />
                      <Route path="/quiver/fins/:id/metrics" element={<GearMetrics type="fin" />} />
                      <Route path="/you" element={<YouPage />} />
                      <Route path="/profile" element={<Navigate to="/quiver/boards" replace />} />
                      <Route path="/profile/locations" element={<Navigate to="/spots" replace />} />
                      <Route path="/profile/boards" element={<Navigate to="/quiver/boards" replace />} />
                      <Route path="/profile/fins" element={<Navigate to="/quiver/fins" replace />} />
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
