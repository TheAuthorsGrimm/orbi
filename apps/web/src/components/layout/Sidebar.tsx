import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, MessageCircle, Timer, Bell, Settings, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { OrbiTier } from "@orbi/types";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tasks",     icon: CheckSquare,    label: "Tasks" },
  { to: "/chat",      icon: MessageCircle,  label: "Orbi AI",   tier: OrbiTier.AGENT },
  { to: "/focus",     icon: Timer,          label: "Focus" },
  { to: "/reminders", icon: Bell,           label: "Reminders", tier: OrbiTier.FULL },
];

const TIER_ORDER = [OrbiTier.FREE, OrbiTier.AGENT, OrbiTier.FULL];

function canAccess(userTier: OrbiTier, required?: OrbiTier) {
  if (!required) return true;
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(required);
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-16 md:w-56 flex flex-col bg-orbi-surface border-r border-orbi-border shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-orbi-border">
        <span className="text-2xl">🔮</span>
        <span className="hidden md:block ml-2 font-bold text-orbi-purple tracking-tight">Orbi</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map(({ to, icon: Icon, label, tier }) => {
          const locked = !canAccess(user!.tier, tier);
          return locked ? (
            <div
              key={to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-orbi-muted cursor-not-allowed opacity-50"
              title={`Requires ${tier} plan`}
            >
              <Icon size={18} />
              <span className="hidden md:block text-sm">{label}</span>
              <Zap size={12} className="hidden md:block ml-auto text-orbi-purple" />
            </div>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-orbi-purple/20 text-orbi-purple"
                    : "text-orbi-muted hover:text-white hover:bg-orbi-border"
                }`
              }
            >
              <Icon size={18} />
              <span className="hidden md:block">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User / bottom */}
      <div className="border-t border-orbi-border p-2 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive ? "bg-orbi-purple/20 text-orbi-purple" : "text-orbi-muted hover:text-white hover:bg-orbi-border"
            }`
          }
        >
          <Settings size={18} />
          <span className="hidden md:block">Settings</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-orbi-purple/30 flex items-center justify-center text-xs font-bold text-orbi-purple shrink-0">
            {user?.displayName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.displayName}</p>
            <p className="text-xs text-orbi-muted capitalize">{user?.tier}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-orbi-muted hover:text-white hover:bg-orbi-border transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden md:block">Log out</span>
        </button>
      </div>
    </aside>
  );
}
