import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Database, MapPin, ShieldAlert } from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { DISASTER_PROFILES } from "@/mock/disasterProfiles";
import { StatusDot } from "@/components/common/Panel";
import { agoLabel, elapsed } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MissionStrip() {
  const { state } = useRescueWave();
  const [, force] = useState(0);

  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const profile = DISASTER_PROFILES[state.mission.disasterType];
  const degraded = state.connection !== "CONNECTED";

  return (
    <div className="shrink-0 border-b border-border bg-surface/95 backdrop-blur-md overflow-x-auto">
      <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-1.5 sm:py-2 min-w-max lg:min-w-0">
        {/* Left Mission Metadata Items */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mission Name Badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
            <span className="size-1.5 rounded-full bg-sky-600" />
            <span>{profile.missionName}</span>
          </div>

          {/* Zone Badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground">
            <MapPin className="size-3 text-muted-foreground" />
            <span>{state.mission.zone}</span>
          </div>

          {/* Mission Clock */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground">
            <Clock className="size-3 text-muted-foreground" />
            <span className="text-muted-foreground">Elapsed:</span>
            <span className="value-tech font-semibold text-foreground">
              {elapsed(state.mission.startedAt)}
            </span>
          </div>

          {/* Threat Level */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold",
              state.mission.threatLevel === "CRITICAL"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : state.mission.threatLevel === "HIGH"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-sky-200 bg-sky-50 text-sky-700"
            )}
          >
            <ShieldAlert className="size-3" />
            <span>Threat {state.mission.threatLevel}</span>
          </div>

          {/* Rover State */}
          <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground lg:flex">
            <StatusDot tone={state.rover.status === "MOVING" ? "accent" : "muted"} pulse />
            <span className="text-muted-foreground">Rover {state.rover.roverId}:</span>
            <span className="font-semibold text-foreground capitalize">
              {state.rover.status.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Right Status Info */}
        <div className="flex items-center gap-3 text-xs">
          {state.bufferedEvents > 0 && (
            <span className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
              <Database className="size-3 text-amber-600" />
              <span>
                {state.bufferedEvents} events queued · synced {agoLabel(state.lastSyncAt)}
              </span>
            </span>
          )}
          <span className="text-[11px] font-medium text-muted-foreground">
            Telemetry sync: <span className="text-foreground">{agoLabel(state.lastTelemetryAt)}</span>
          </span>
        </div>
      </div>

      {degraded && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-rose-600" />
            <span>
              Telemetry link currently offline. Displaying last cached telemetry from{" "}
              {agoLabel(state.lastTelemetryAt)}.
            </span>
          </div>
          <div className="value-tech text-[11px] text-rose-700">
            Last position: {state.rover.latitude.toFixed(5)}, {state.rover.longitude.toFixed(5)} ({state.mission.zone})
          </div>
        </div>
      )}
    </div>
  );
}
