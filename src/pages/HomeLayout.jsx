import { NavLink, Outlet, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/home/data', label: 'Data' },
  { to: '/home/forecast', label: 'Forecast' },
]

export default function HomeLayout() {
  const location = useLocation()

  return (
    <div>
      <nav className="flex border-b border-retro-border bg-retro-surface" aria-label="Home sections">
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
