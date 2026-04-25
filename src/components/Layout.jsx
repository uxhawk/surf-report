import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";
import { Button } from "./ui/Button";
import { CornerUpLeft } from "pixelarticons/react/CornerUpLeft.js";

const PAGE_TITLES = {
  "/home": "Surf Tracker",
  "/log": "Log Session",
  "/spots": "Spots",
  "/quiver/boards": "Quiver",
  "/quiver/fins": "Quiver",
  "/you": "You",
};

function getTitle(pathname, state) {
  if (pathname.startsWith("/sessions/")) return "Edit Session";
  if (pathname.includes("/metrics")) {
    if (state?.name) return `${state.name} Metrics`;
    if (pathname.startsWith("/quiver/boards/")) return "Board Metrics";
    if (pathname.startsWith("/quiver/fins/")) return "Fin Metrics";
    if (pathname.startsWith("/spots/")) return "Spot Metrics";
  }
  return PAGE_TITLES[pathname] ?? "Surf Tracker";
}

function showsBackButton(pathname) {
  return pathname.startsWith("/sessions/") || pathname.includes("/metrics");
}

function isMetricsPage(pathname) {
  return pathname.includes("/metrics");
}

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = getTitle(location.pathname, location.state);
  const hasBack = showsBackButton(location.pathname);
  const hideNav = isMetricsPage(location.pathname);

  return (
    <div className="min-h-dvh bg-retro-bg flex flex-col max-w-2xl mx-auto">
      {/* Sticky title bar */}
      <header className="sticky top-0 z-40 bg-retro-bg border-b border-retro-border px-4 pb-3 pt-[calc(0.25rem+env(safe-area-inset-top,0px))] flex items-center gap-3">
        {hasBack && (
          <Button size="sm" variant="ghost" onClick={() => navigate(-1)}>
            <CornerUpLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <h1 className="font-display text-neon-yellow text-[10px] leading-none flex-1 truncate">
          {title}
        </h1>
      </header>

      {/* Page content */}
      <main className={`flex-1 ${hideNav ? "" : "pb-20"}`}>{children}</main>

      {/* Sticky bottom nav */}
      {!hideNav && (
        <div className="sticky bottom-0 z-40">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
