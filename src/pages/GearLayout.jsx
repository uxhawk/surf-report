import { NavLink, Outlet, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/profile/locations', label: 'Locations' },
  { to: '/profile/boards', label: 'Boards' },
  { to: '/profile/fins', label: 'Fins' },
]

export default function GearLayout() {
  const location = useLocation()

  return (
    <div>
      {/* Gear sub-tabs */}
      <nav className="flex border-b border-retro-border bg-retro-surface" aria-label="Gear sections">
        {TABS.map(tab => {
          const active = location.pathname === tab.to
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`
                flex-1 text-center py-3 text-xs font-display
                border-b-2 transition-colors duration-150
                ${active
                  ? 'border-neon-pink text-neon-pink'
                  : 'border-transparent text-retro-muted hover:text-white'
                }
              `}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </NavLink>
          )
        })}
      </nav>

      <Outlet />
    </div>
  )
}
