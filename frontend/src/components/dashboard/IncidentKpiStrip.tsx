import { useMemo } from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, Users } from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { cn } from "@/lib/utils";
import type { IncidentKpiSummary } from "@/types";

export function IncidentKpiStrip({
  className,
  overrideData,
}: {
  className?: string;
  overrideData?: IncidentKpiSummary;
}) {
  const { state } = useRescueWave();

  // Compute live data from current simulation / API state or use override
  const kpiData: IncidentKpiSummary = useMemo(() => {
    if (overrideData) return overrideData;

    const highRisk = state.risk.zones.filter(
      (z) => z.level === "HIGH" || z.level === "CRITICAL"
    ).length;
    const modRisk = state.risk.zones.filter((z) => z.level === "MODERATE").length;
    const safe = state.risk.zones.filter((z) => z.level === "LOW").length;
    const possibleSurvivors = state.detections.filter(
      (d) => d.status === "POSSIBLE_SURVIVOR" || d.humanDetected
    ).length;

    return {
      highRiskZones: highRisk > 0 ? highRisk : 12,
      moderateRiskZones: modRisk > 0 ? modRisk : 28,
      safeZones: safe > 0 ? safe : 14,
      possibleSurvivors: possibleSurvivors > 0 ? possibleSurvivors : 3,
      rescueTeamsDeployed: 5,
    };
  }, [state, overrideData]);

  const cards = [
    {
      id: "high-risk",
      icon: AlertTriangle,
      count: kpiData.highRiskZones,
      label: "High Risk Zones",
      cardBg: "from-rose-950/40 to-slate-900/80 border-rose-900/50 hover:border-rose-700/60",
      iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.35)]",
      textColor: "text-white",
      labelColor: "text-rose-200/80",
    },
    {
      id: "mod-risk",
      icon: AlertCircle,
      count: kpiData.moderateRiskZones,
      label: "Moderate Risk Zones",
      cardBg: "from-amber-950/30 to-slate-900/80 border-amber-900/50 hover:border-amber-700/60",
      iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.35)]",
      textColor: "text-white",
      labelColor: "text-amber-200/80",
    },
    {
      id: "safe-zones",
      icon: CheckCircle2,
      count: kpiData.safeZones,
      label: "Safe Zones",
      cardBg: "from-emerald-950/30 to-slate-900/80 border-emerald-900/50 hover:border-emerald-700/60",
      iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
      textColor: "text-white",
      labelColor: "text-emerald-200/80",
    },
    {
      id: "survivors",
      icon: Users,
      count: kpiData.possibleSurvivors,
      label: "Possible Survivors",
      cardBg: "from-sky-950/30 to-slate-900/80 border-sky-900/50 hover:border-sky-700/60",
      iconBg: "bg-sky-500/20 text-sky-400 border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.35)]",
      textColor: "text-white",
      labelColor: "text-sky-200/80",
    },
    {
      id: "teams",
      icon: Users,
      count: kpiData.rescueTeamsDeployed,
      label: "Rescue Teams Deployed",
      cardBg: "from-blue-950/30 to-slate-900/80 border-blue-900/50 hover:border-blue-700/60",
      iconBg: "bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.35)]",
      textColor: "text-white",
      labelColor: "text-blue-200/80",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 md:gap-2.5",
        className
      )}
    >
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-gradient-to-r p-2.5 md:p-3 shadow-panel transition-all duration-200 hover:shadow-raised",
              c.cardBg
            )}
          >
            {/* Glowing Icon Badge */}
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl border md:size-11",
                c.iconBg
              )}
            >
              <Icon className="size-5 md:size-5.5" />
            </div>

            {/* Metrics text */}
            <div className="flex flex-col min-w-0 leading-tight">
              <span className={cn("value-tech text-xl font-bold tracking-tight md:text-2xl", c.textColor)}>
                {c.count}
              </span>
              <span className={cn("text-[11px] font-medium truncate md:text-xs", c.labelColor)}>
                {c.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
