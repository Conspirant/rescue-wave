import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel, StatusDot } from "@/components/common/Panel";
import { cn } from "@/lib/utils";

export function SystemHealth({ className }: { className?: string }) {
  const { state } = useRescueWave();
  const connected = state.connection === "CONNECTED";
  const health = Math.round(state.rover.battery * 0.3 + state.rover.signal * 0.4 + (connected ? 100 : 20) * 0.3);

  const subsystems: [string, string, boolean][] = [
    ["Rover Node", connected ? "Online" : "Offline", connected],
    ["GPS Receiver", state.rover.gpsStatus, state.rover.gpsStatus === "LOCKED"],
    ["Camera Gimbal", state.rover.cameraStatus, state.rover.cameraStatus === "LIVE"],
    ["Live Telemetry", connected ? "Stream Sync" : "Buffered", connected],
    ["Radar Array", "Calibrated", true],
    ["Internal Battery", `${state.rover.battery.toFixed(0)}% Cap`, state.rover.battery > 25],
    ["Network Link", connected ? "Nominal" : "Degraded", connected],
  ];

  return (
    <Panel className={className} title="Operational Readiness" subtitle="Composite subsystem telemetry diagnostics">
      {/* Overall Score with Progress Bar */}
      <div className="rounded-xl border border-border bg-slate-50/60 p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Composite Index</span>
          <span className={cn("value-tech text-2xl font-bold tracking-tight", health > 80 ? "text-emerald-700" : "text-amber-800")}>
            {health}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={cn("h-full rounded-full transition-all duration-300", health > 80 ? "bg-emerald-600" : "bg-amber-600")}
            style={{ width: `${health}%` }}
          />
        </div>
      </div>

      {/* Subsystems List */}
      <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {subsystems.map(([name, status, isOk]) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs shadow-xs"
          >
            <span className="text-muted-foreground font-medium">{name}</span>
            <div className="flex items-center gap-1.5">
              <StatusDot tone={isOk ? "success" : "critical"} pulse={!isOk} />
              <span className={cn("value-tech font-semibold", isOk ? "text-foreground" : "text-rose-600")}>
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
