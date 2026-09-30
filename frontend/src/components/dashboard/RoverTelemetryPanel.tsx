import {
  BatteryMedium,
  Compass,
  Gauge,
  Signal,
  Thermometer,
  Video,
  Satellite,
  Activity,
} from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel, Readout, StatusDot } from "@/components/common/Panel";
import { Sparkline } from "@/components/common/Sparkline";
import { headingLabel } from "@/lib/format";

export function RoverTelemetryPanel() {
  const { state } = useRescueWave();
  const r = state.rover;
  const hist = state.history;

  return (
    <Panel
      title="Rover Live Telemetry"
      subtitle={`Unit ${r.roverId} · Operating Mode: ${r.mode}`}
      actions={
        <span className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-400">
          <StatusDot tone={r.status === "MOVING" ? "accent" : "muted"} pulse />
          <span className="capitalize">{r.status.toLowerCase()}</span>
        </span>
      }
    >
      {/* Primary Readout Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
        <Readout label="Ground Speed" value={r.speed.toFixed(1)} unit="m/s" />
        <Readout label="Compass Heading" value={headingLabel(r.heading)} hint={`${r.heading.toFixed(0)}°`} />
        <Readout
          label="Battery Level"
          value={r.battery.toFixed(0)}
          unit="%"
          tone={r.battery < 25 ? "critical" : r.battery < 60 ? "warning" : "success"}
        />
        <Readout
          label="Signal Strength"
          value={r.signal.toFixed(0)}
          unit="%"
          tone={r.signal < 65 ? "warning" : "success"}
        />
        <Readout label="GPS Fix" value={r.gpsStatus} tone={r.gpsStatus === "LOCKED" ? "success" : "warning"} />
        <Readout label="Camera Link" value={r.cameraStatus} tone="accent" />
        <Readout label="Internal Temp" value={r.temperature.toFixed(0)} unit="°C" />
        <Readout
          label="GPS Coordinates"
          value={<span className="text-xs">{r.latitude.toFixed(4)}° N</span>}
          hint={`${r.longitude.toFixed(4)}° E`}
        />
      </div>

      {/* Real-time Trend Sparklines */}
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {[
          { label: "Battery Trend", icon: BatteryMedium, values: hist.map((h) => h.battery), tone: "success" as const },
          { label: "Speed Trend", icon: Gauge, values: hist.map((h) => h.speed), tone: "accent" as const },
          { label: "Signal Stability", icon: Signal, values: hist.map((h) => h.signal), tone: "warning" as const },
        ].map(({ label, icon: Icon, values, tone }) => (
          <div key={label} className="rounded-lg border border-border/70 bg-surface-muted/30 p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon className="size-3.5" />
                <span>{label}</span>
              </div>
              <Activity className="size-3 text-muted-foreground/60" />
            </div>
            <div className="mt-2">
              <Sparkline values={values.length ? values : [0, 0]} tone={tone} />
            </div>
          </div>
        ))}
      </div>

      {/* Sensor Health Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        {[
          { icon: Satellite, label: "GNSS Navigation", value: r.gpsStatus, ok: r.gpsStatus === "LOCKED" },
          { icon: Video, label: "Optical Feed", value: r.cameraStatus, ok: r.cameraStatus === "LIVE" },
          { icon: Compass, label: "Autonomy Mode", value: r.mode, ok: true },
          { icon: Thermometer, label: "Thermal Envelope", value: "Nominal", ok: true },
        ].map(({ icon: Icon, label, value, ok }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface-muted/40 px-2.5 py-1 text-xs"
          >
            <Icon className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{label}:</span>
            <span className={`value-tech font-semibold ${ok ? "text-emerald-400" : "text-amber-400"}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
