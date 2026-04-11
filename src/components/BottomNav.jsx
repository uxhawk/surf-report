import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/log', label: 'Log Surf', icon: '🌊' },
  { to: '/gear', label: 'Profile', icon: '🏄' },
]

export default function BottomNav() {
  const location = useLocation()

  function isActive(item) {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <nav
      className="bg-retro-surface border-b border-retro-border"
      aria-label="Main navigation"
    >
      <ul className="flex">
        {NAV_ITEMS.map(item => {
          const active = isActive(item)
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                className={`
                  relative flex flex-col items-center gap-1 py-3 px-2 w-full
                  transition-colors duration-150
                  ${active ? 'text-neon-pink' : 'text-retro-muted'}
                `}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span
                  className={`text-[9px] font-display leading-none ${
                    active ? 'text-neon-pink' : 'text-retro-muted'
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <span className="absolute bottom-0 inset-x-0 h-[2px] bg-neon-pink rounded-t" />
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
