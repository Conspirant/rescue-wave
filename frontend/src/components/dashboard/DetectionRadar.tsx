import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel, StatusDot } from "@/components/common/Panel";
import { agoLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Detection } from "@/types";

const RADAR_RANGE = 12; // metres represented by the radar disc

export function DetectionRadar({ className }: { className?: string }) {
  const { state } = useRescueWave();
  const active = state.detections.filter((d) => d.status !== "DISMISSED");
  const primary = active[0];

  return (
    <Panel
      className={className}
      title="Presence Radar"
      subtitle={`Range ${RADAR_RANGE} m · mmWave Radar Sensor`}
      actions={
        <span className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-400">
          <StatusDot tone={active.length ? "critical" : "muted"} pulse={Boolean(active.length)} />
          <span>{active.length} Contact{active.length === 1 ? "" : "s"}</span>
        </span>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Radar Disc Viewport */}
        <div className="relative mx-auto aspect-square w-52 shrink-0">
          <div className="absolute inset-0 rounded-full border border-border/80 bg-slate-950/80 shadow-inner" />
          
          {/* Concentric Range Rings */}
          {[0.75, 0.5, 0.25].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border border-border/40"
              style={{ inset: `${(1 - r) * 50}%` }}
            />
          ))}

          {/* Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border/40" />
          <div className="absolute top-1/2 right-0 left-0 h-px bg-border/40" />

          {/* Range Labels */}
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground/60">
            12m
          </span>
          <span className="absolute top-[26%] left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground/60">
            6m
          </span>

          {/* Radar Sweep Effect */}
          <div
            className="animate-sweep absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(56, 189, 248, 0.25), transparent 75deg)",
            }}
          />

          {/* Center Origin (Rover Position) */}
          <div className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400 ring-4 ring-sky-500/20" />

          {/* Active Target Contacts */}
          {active.map((d) => {
            const ratio = Math.min(1, d.distance / RADAR_RANGE) * 0.46;
            const rad = ((d.bearing - 90) * Math.PI) / 180;
            const x = 50 + Math.cos(rad) * ratio * 100;
            const y = 50 + Math.sin(rad) * ratio * 100;
            const isConfirmed = d.status !== "UNVERIFIED";
            return (
              <div
                key={d.targetId}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span
                  className={cn(
                    "block size-3 rounded-full ring-2 ring-slate-900 shadow-sm",
                    isConfirmed ? "bg-rose-500" : "bg-amber-400"
                  )}
                />
                {isConfirmed && (
                  <span className="animate-pulse-ring absolute -inset-1.5 rounded-full border border-rose-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Primary Contact Assessment Box */}
        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-border/80 bg-surface-muted/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Detection Status</span>
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
                  primary?.humanDetected
                    ? "border-rose-500/30 bg-rose-500/15 text-rose-400"
                    : "border-border/60 bg-surface-muted text-muted-foreground"
                )}
              >
                {primary?.humanDetected ? "Human Signature Confirmed" : "Area Clear"}
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-surface/60 p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground">Confidence</span>
                <p className="value-tech text-base font-bold text-foreground">
                  {primary ? `${primary.confidence}%` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-surface/60 p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground">Proximity</span>
                <p className="value-tech text-base font-bold text-sky-400">
                  {primary ? `${primary.distance.toFixed(1)} m` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-surface/60 p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground">Motion Activity</span>
                <p className="font-semibold text-foreground capitalize">
                  {primary?.motion.toLowerCase() ?? "None"}
                </p>
              </div>
              <div className="rounded-lg bg-surface/60 p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground">Last Recorded</span>
                <p className="font-semibold text-foreground">
                  {primary ? agoLabel(primary.timestamp) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Queue */}
          <ul className="mt-2.5 space-y-1.5">
            {active.slice(0, 3).map((d) => (
              <TargetRow key={d.targetId} det={d} />
            ))}
            {active.length === 0 && (
              <li className="rounded-lg border border-dashed border-border/70 p-3 text-center text-xs text-muted-foreground">
                No active radar signatures in detection sector
              </li>
            )}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

function TargetRow({ det }: { det: Detection }) {
  const strong = det.status !== "UNVERIFIED";
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface/60 px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", strong ? "bg-rose-500" : "bg-amber-400")} />
        <span className="font-bold text-foreground">{det.targetId}</span>
      </div>
      <span className="value-tech text-muted-foreground">
        {det.distance.toFixed(1)} m · {det.confidence}% conf
      </span>
      <span
        className={cn(
          "rounded-md border px-2 py-0.5 text-[10px] font-semibold",
          strong
            ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
        )}
      >
        {strong ? "Possible Survivor" : "Unverified"}
      </span>
    </li>
  );
}
