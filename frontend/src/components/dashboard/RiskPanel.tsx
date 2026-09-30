import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel } from "@/components/common/Panel";
import { cn } from "@/lib/utils";
import { DISASTER_PROFILES } from "@/mock/disasterProfiles";

export function RiskPanel({ className }: { className?: string }) {
  const { state, actions } = useRescueWave();
  const profile = DISASTER_PROFILES[state.mission.disasterType];

  const riskBadge = {
    LOW: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    MODERATE: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    HIGH: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    CRITICAL: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  };

  const riskBar = {
    LOW: "bg-emerald-400",
    MODERATE: "bg-yellow-400",
    HIGH: "bg-amber-400",
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
            className="rounded-lg border border-border/70 bg-surface-muted/30 p-2.5 transition-colors hover:bg-surface-muted/50"
          >
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => actions.toggleRiskLayer(l.id)}
                aria-pressed={l.enabled}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-all duration-150",
                  l.enabled
                    ? "border-sky-500/40 bg-sky-500/15 text-sky-300"
                    : "border-border/60 bg-surface text-muted-foreground/80 hover:text-foreground"
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
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
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
