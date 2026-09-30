import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel } from "@/components/common/Panel";
import { cn } from "@/lib/utils";
import { DISASTER_PROFILES } from "@/mock/disasterProfiles";

export function RiskPanel({ className }: { className?: string }) {
  const { state, actions } = useRescueWave();
  const profile = DISASTER_PROFILES[state.mission.disasterType];

  const riskBadge = {
    LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
    MODERATE: "border-yellow-200 bg-yellow-50 text-yellow-800",
    HIGH: "border-amber-200 bg-amber-50 text-amber-800",
    CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
  };

  const riskBar = {
    LOW: "bg-emerald-500",
    MODERATE: "bg-yellow-500",
    HIGH: "bg-amber-500",
    CRITICAL: "bg-rose-500",
  };

  return (
    <Panel
      className={className}
      title="Environmental Risk"
      subtitle={`${profile.disasterType} scenario · ${profile.terrain}`}
    >
      <ul className="space-y-2">
        {state.risk.layers.map((l) => (
          <li
            key={l.id}
            className="rounded-lg border border-border bg-slate-50/60 p-2.5 transition-colors hover:bg-slate-100/60"
          >
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => actions.toggleRiskLayer(l.id)}
                aria-pressed={l.enabled}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-all duration-150",
                  l.enabled
                    ? "border-sky-300 bg-sky-50 text-sky-700 font-semibold shadow-xs"
                    : "border-border bg-surface text-slate-600 hover:text-slate-900"
                )}
              >
                {l.enabled ? "Layer On" : "Layer Off"}
              </button>
              <span className="text-xs font-semibold text-foreground truncate">{l.label}</span>
              <span className={cn("ml-auto rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase", riskBadge[l.level])}>
                {l.level}
              </span>
              <span className="value-tech w-14 text-right text-xs font-bold text-foreground">
                {l.value}
                {l.unit}
              </span>
            </div>

            {/* Visual Risk Bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn("h-full rounded-full transition-all duration-300", riskBar[l.level])}
                style={{ width: `${Math.min(100, l.unit === "%" ? l.value : l.value * 25)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Risk Category Legend */}
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
        <span className="text-muted-foreground font-medium">Risk Index:</span>
        <div className="flex gap-1.5">
          {(["LOW", "MODERATE", "HIGH", "CRITICAL"] as const).map((lvl) => (
            <span key={lvl} className={cn("rounded-md border px-1.5 py-0.5 text-[9px] font-bold", riskBadge[lvl])}>
              {lvl}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}
