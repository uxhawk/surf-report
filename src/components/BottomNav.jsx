import { NavLink, useLocation } from "react-router-dom";
import { Home } from "pixelarticons/react/Home.js";
import { PlusBox } from "pixelarticons/react/PlusBox.js";
import { MapPin } from "pixelarticons/react/MapPin.js";
import { Gift } from "pixelarticons/react/Gift.js";
import { AvatarSquare } from "pixelarticons/react/AvatarSquare.js";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/spots", label: "Spots", icon: MapPin },
  { to: "/log", label: "Log Surf", icon: PlusBox, primary: true },
  { to: "/quiver", label: "Quiver", icon: Gift },
  { to: "/you", label: "You", icon: AvatarSquare },
];

export default function BottomNav() {
  const location = useLocation();

  function isActive(item) {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  }

  return (
    <nav
      className="bg-retro-surface border-t border-retro-border pb-4"
      aria-label="Main navigation"
    >
      <ul className="grid grid-cols-[1fr_1fr_auto_1fr_1fr] items-stretch gap-2 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);

          if (item.primary) {
            return (
              <li key={item.to} className="flex justify-center px-2">
                <NavLink
                  to={item.to}
                  className="self-center flex items-center justify-center w-11 h-11 rounded-full bg-neon-pink text-retro-bg shadow-lg transition-transform duration-150 active:scale-95"
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="w-6 h-6" />
                </NavLink>
              </li>
            );
          }

          return (
            <li key={item.to} className="min-w-0">
              <NavLink
                to={item.to}
                className={`
                  relative flex flex-col items-center gap-1 py-3 px-2 w-full
                  transition-colors duration-150
                  ${active ? "text-neon-pink" : "text-retro-muted"}
                `}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="w-5 h-5" />
                <span
                  className={`text-[8px] font-display leading-none whitespace-nowrap ${active ? "text-neon-pink" : "text-retro-muted"
                    }`}
                >
                  {item.label}
                </span>
                {active && (
                  <span className="absolute top-0 inset-x-0 h-[2px] bg-neon-pink rounded-b" />
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
