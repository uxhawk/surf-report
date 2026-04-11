import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from './BottomNav'
import { Button } from './ui/Button'
import { CornerUpLeft } from 'pixelarticons/react/CornerUpLeft.js'
import { Logout } from 'pixelarticons/react/Logout.js'

const PAGE_TITLES = {
  '/': 'Surf Tracker',
  '/log': 'Log Session',
  '/profile/locations': 'Profile',
  '/profile/boards': 'Profile',
  '/profile/fins': 'Profile',
}

function getTitle(pathname, state) {
  if (pathname.startsWith('/sessions/')) return 'Edit Session'
  if (pathname.includes('/metrics')) {
    if (state?.name) return `${state.name} Metrics`
    if (pathname.startsWith('/profile/boards/')) return 'Board Metrics'
    if (pathname.startsWith('/profile/fins/')) return 'Fin Metrics'
    if (pathname.startsWith('/profile/locations/')) return 'Location Metrics'
  }
  return PAGE_TITLES[pathname] ?? 'Surf Tracker'
}

function showsBackButton(pathname) {
  return pathname.startsWith('/sessions/') || pathname.includes('/metrics')
}

function isMetricsPage(pathname) {
  return pathname.includes('/metrics')
}

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const title = getTitle(location.pathname, location.state)
  const hasBack = showsBackButton(location.pathname)
  const hideNav = isMetricsPage(location.pathname)

  return (
    <div className="min-h-dvh bg-retro-bg flex flex-col max-w-2xl mx-auto">
      {/* Sticky top chrome: title bar + nav */}
      <div className="sticky top-0 z-40">
        <header className="bg-retro-bg border-b border-retro-border px-4 py-3 flex items-center gap-3">
          {hasBack && (
            <Button size="sm" variant="ghost" onClick={() => navigate(-1)}><CornerUpLeft className="w-4 h-4" /> Back</Button>
          )}
          <h1 className="font-display text-neon-yellow text-[10px] leading-none flex-1 truncate">
            {title}
          </h1>
          <Button
            size="sm"
            variant="ghost"
            onClick={signOut}
            aria-label="Sign out"
          >
            <Logout className="w-4 h-4" />
          </Button>
        </header>
        {!hideNav && <BottomNav />}
      </div>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
