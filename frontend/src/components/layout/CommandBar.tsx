import { useEffect, useState } from "react";
import {
  Activity,
  BatteryMedium,
  Clock,
  PlayCircle,
  Radio,
  ShieldAlert,
  StopCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { DISASTER_TYPES } from "@/mock/disasterProfiles";
import { StatusDot } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clockTime } from "@/lib/format";
import type { DisasterType } from "@/types";

function MetricPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="hidden items-center gap-2 rounded-lg border border-border/70 bg-surface-muted/40 px-2.5 py-1 xl:flex">
      {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      <div className="flex flex-col leading-none">
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
        <span className={`value-tech mt-0.5 text-xs font-semibold ${tone ?? "text-foreground"}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function CommandBar() {
  const { state, actions } = useRescueWave();
  const [clock, setClock] = useState(() => clockTime(Date.now()));

  useEffect(() => {
    const t = setInterval(() => setClock(clockTime(Date.now())), 1000);
    return () => clearInterval(t);
  }, []);

  const connected = state.connection === "CONNECTED";
  const health = Math.round(
    state.rover.battery * 0.3 + state.rover.signal * 0.4 + (connected ? 100 : 20) * 0.3
  );

  return (
    <header className="flex h-15 shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-surface px-4 shadow-sm">
      {/* Brand & System Status */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-700 shadow-md shadow-sky-500/20 text-white">
          <Radio className="size-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-foreground">RESCUEWAVE</span>
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:inline-flex">
              <StatusDot tone="success" pulse />
              Active Link
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Disaster Operations Command</p>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="flex items-center gap-2">
        <span className="hidden text-xs font-medium text-muted-foreground md:inline">
          Incident Scenario:
        </span>
        <Select
          value={state.mission.disasterType}
          onValueChange={(v) => actions.setDisaster(v as DisasterType)}
        >
          <SelectTrigger className="h-8.5 w-32 sm:w-44 rounded-lg border-border bg-surface text-xs font-medium text-foreground transition-colors hover:border-border-strong">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-surface text-foreground shadow-raised">
            {DISASTER_TYPES.map((d) => (
              <SelectItem key={d} value={d} className="text-xs font-medium capitalize">
                {d.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Real-time Telemetry & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <MetricPill
          icon={Clock}
          label="UTC Time"
          value={clock}
        />

        <MetricPill
          icon={BatteryMedium}
          label={`Rover ${state.rover.roverId}`}
          value={`${state.rover.battery.toFixed(0)}% bat · ${state.rover.status}`}
          tone={state.rover.battery < 25 ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}
        />

        {/* Connection Status Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border bg-surface-muted px-2 sm:px-2.5 py-1">
          <StatusDot tone={connected ? "success" : "critical"} pulse={!connected} />
          <div className="flex flex-col leading-none">
            <span className="hidden text-[10px] font-medium text-muted-foreground sm:inline">Network</span>
            <span className="value-tech text-[11px] sm:text-xs font-semibold text-foreground">
              {connected ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 pl-0.5">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 sm:px-2.5 gap-1.5 rounded-lg border-border bg-surface text-xs font-medium transition-all hover:bg-surface-muted"
            onClick={() => actions.setConnection(connected ? "OFFLINE" : "CONNECTED")}
            title="Simulate rover telemetry link disconnect or recovery"
          >
            {connected ? <Wifi className="size-3.5 text-sky-600" /> : <WifiOff className="size-3.5 text-rose-600" />}
            <span className="hidden lg:inline">{connected ? "Online" : "Offline"}</span>
          </Button>

          <Button
            size="sm"
            className="h-8 px-2.5 sm:px-3 gap-1.5 rounded-lg text-xs font-medium shadow-sm transition-all bg-sky-600 hover:bg-sky-700 text-white"
            variant={state.demoRunning ? "destructive" : "default"}
            onClick={() => (state.demoRunning ? actions.stopDemo() : actions.startDemo())}
          >
            {state.demoRunning ? <StopCircle className="size-3.5" /> : <PlayCircle className="size-3.5" />}
            <span className="hidden sm:inline">{state.demoRunning ? "Stop Demo" : "Run Demo"}</span>
            <span className="sm:hidden">{state.demoRunning ? "Stop" : "Demo"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function TelemetryBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-sky-700">
      <Activity className="size-3" />
      <span className="text-xs font-medium text-sky-700">Live Telemetry</span>
    </span>
  );
}

export function ThreatBadge({ level }: { level: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-amber-700">
      <ShieldAlert className="size-3" />
      <span className="text-xs font-medium text-amber-700">{level}</span>
    </span>
  );
}
