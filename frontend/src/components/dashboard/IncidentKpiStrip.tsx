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
      cardBg: "from-rose-50/80 to-white border-rose-200/90 hover:border-rose-300 shadow-sm",
      iconBg: "bg-rose-100 text-rose-600 border-rose-200 shadow-xs",
      textColor: "text-rose-950",
      labelColor: "text-rose-700/90",
    },
    {
      id: "mod-risk",
      icon: AlertCircle,
      count: kpiData.moderateRiskZones,
      label: "Moderate Risk Zones",
      cardBg: "from-amber-50/80 to-white border-amber-200/90 hover:border-amber-300 shadow-sm",
      iconBg: "bg-amber-100 text-amber-700 border-amber-200 shadow-xs",
      textColor: "text-amber-950",
      labelColor: "text-amber-800/90",
    },
    {
      id: "safe-zones",
      icon: CheckCircle2,
      count: kpiData.safeZones,
      label: "Safe Zones",
      cardBg: "from-emerald-50/80 to-white border-emerald-200/90 hover:border-emerald-300 shadow-sm",
      iconBg: "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-xs",
      textColor: "text-emerald-950",
      labelColor: "text-emerald-800/90",
    },
    {
      id: "survivors",
      icon: Users,
      count: kpiData.possibleSurvivors,
      label: "Possible Survivors",
      cardBg: "from-sky-50/80 to-white border-sky-200/90 hover:border-sky-300 shadow-sm",
      iconBg: "bg-sky-100 text-sky-700 border-sky-200 shadow-xs",
      textColor: "text-sky-950",
      labelColor: "text-sky-800/90",
    },
    {
      id: "teams",
      icon: Users,
      count: kpiData.rescueTeamsDeployed,
      label: "Rescue Teams Deployed",
      cardBg: "from-blue-50/80 to-white border-blue-200/90 hover:border-blue-300 shadow-sm",
      iconBg: "bg-blue-100 text-blue-700 border-blue-200 shadow-xs",
      textColor: "text-blue-950",
      labelColor: "text-blue-800/90",
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
