import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
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
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogSurf />} />
          <Route path="/sessions/:id/edit" element={<EditSession />} />
          <Route path="/gear/boards/:id/metrics" element={<GearMetrics type="board" />} />
          <Route path="/gear/fins/:id/metrics" element={<GearMetrics type="fin" />} />
          <Route path="/gear/locations/:id/metrics" element={<GearMetrics type="location" />} />
          <Route path="/gear" element={<GearLayout />}>
            <Route index element={<Navigate to="locations" replace />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="boards" element={<BoardsPage />} />
            <Route path="fins" element={<FinsPage />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  )
}
