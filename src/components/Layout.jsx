import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'

const PAGE_TITLES = {
  '/': '🏄 Surf Tracker',
  '/log': 'Log Session',
  '/gear/locations': 'Gear',
  '/gear/boards': 'Gear',
  '/gear/fins': 'Gear',
}

function getTitle(pathname) {
  if (pathname.startsWith('/sessions/')) return 'Edit Session'
  return PAGE_TITLES[pathname] ?? 'Surf Tracker'
}

function showsBackButton(pathname) {
  return pathname.startsWith('/sessions/')
}

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const title = getTitle(location.pathname)
  const hasBack = showsBackButton(location.pathname)

  return (
    <div className="min-h-dvh bg-retro-bg flex flex-col max-w-2xl mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-retro-bg border-b border-retro-border px-4 py-3 flex items-center gap-3">
        {hasBack && (
          <button
            onClick={() => navigate(-1)}
            className="text-neon-cyan text-sm p-1 -ml-1"
            aria-label="Go back"
          >
            ← Back
          </button>
        )}
        <h1 className="font-display text-neon-yellow text-[10px] leading-none flex-1 truncate">
          {title}
        </h1>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  )
}
