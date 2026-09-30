import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bot,
  ClipboardList,
  LayoutDashboard,
  Map,
  Radar,
  Settings,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { StatusDot } from "@/components/common/Panel";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/map", label: "Live Tactical Map", icon: Map },
  { to: "/rover", label: "Rover Controls", icon: Bot },
  { to: "/detection", label: "Detection & Radar", icon: Radar },
  { to: "/alerts", label: "Alert Center", icon: TriangleAlert },
  { to: "/risk", label: "Risk Intel", icon: ShieldAlert },
  { to: "/log", label: "Mission Log", icon: ClipboardList },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function NavRail() {
  const { state } = useRescueWave();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unack = state.alerts.filter((a) => !a.acknowledged).length;

  return (
    <nav
      aria-label="Primary Navigation"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-border/80 bg-sidebar p-2 md:w-56 md:flex-col md:overflow-visible md:border-r md:border-b-0 md:p-3"
    >
      <div className="flex gap-1 md:flex-1 md:flex-col md:gap-1.5">
        <div className="hidden px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 md:block">
          Navigation
        </div>
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex shrink-0 items-center gap-2.5 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium transition-all duration-150",
                active
                  ? "bg-sky-50 text-sky-700 border border-sky-200 shadow-xs font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              )}
            >
              <Icon className={cn("size-4 shrink-0 transition-colors", active ? "text-sky-600" : "text-slate-500 group-hover:text-slate-800")} />
              <span className="whitespace-nowrap">{label}</span>
              {to === "/alerts" && unack > 0 && (
                <span className="ml-auto flex items-center justify-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                  {unack}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Rover Status Card */}
      <div className="hidden rounded-xl border border-border bg-surface p-3 shadow-panel md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Bot className="size-3.5 text-sky-600" />
            <span className="text-xs font-bold text-foreground">Unit {state.rover.roverId}</span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-slate-600">
            <StatusDot tone={state.connection === "CONNECTED" ? "success" : "critical"} pulse />
            {state.connection === "CONNECTED" ? "Online" : "Offline"}
          </span>
        </div>

        {/* Battery Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-muted-foreground">Battery Level</span>
            <span className="value-tech font-semibold text-foreground">{state.rover.battery.toFixed(0)}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                state.rover.battery < 25 ? "bg-rose-500" : state.rover.battery < 60 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${state.rover.battery}%` }}
            />
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5 pt-2 border-t border-border text-[11px]">
          <div>
            <span className="text-[10px] text-muted-foreground">Signal</span>
            <p className="value-tech font-semibold text-foreground">{state.rover.signal.toFixed(0)}%</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">GPS</span>
            <p className="value-tech font-semibold text-emerald-600">{state.rover.gpsStatus}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
