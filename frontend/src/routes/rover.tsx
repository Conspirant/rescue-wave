import { createFileRoute } from "@tanstack/react-router";
import { RoverTelemetryPanel } from "@/components/dashboard/RoverTelemetryPanel";
import { RoverControls } from "@/components/dashboard/RoverControls";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { LiveCamera } from "@/components/dashboard/LiveCamera";
import { Panel } from "@/components/common/Panel";
import { useRescueWave } from "@/hooks/useRescueWave";
import { agoLabel } from "@/lib/format";

export const Route = createFileRoute("/rover")({
  head: () => ({
    meta: [
      { title: "Rover — RescueWave" },
      { name: "description", content: "Rover telemetry, control panel, local alert hardware and diagnostics." },
      { property: "og:title", content: "Rover — RescueWave" },
      { property: "og:description", content: "Rover telemetry, control panel, local alert hardware and diagnostics." },
    ],
  }),
  component: RoverPage,
});

function RoverPage() {
  const { state } = useRescueWave();

  return (
    <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-12">
      <div className="flex flex-col gap-2.5 xl:col-span-8">
        <RoverControls />
        <RoverTelemetryPanel />
        <LiveCamera />
      </div>
      <div className="flex flex-col gap-2.5 xl:col-span-4">
        <SystemHealth />
        <Panel title="Local Alert Hardware" subtitle="On-board operator-independent alerting">
          <dl className="space-y-1">
            {[
              ["Local alert", "READY"],
              ["LED", "ARMED"],
              ["Buzzer", "ARMED"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border py-1">
                <dt className="label-tech">{k}</dt>
                <dd className="value-tech text-[11px] font-semibold text-success">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Hardware Diagnostics" subtitle="Technical view">
          <dl className="space-y-1">
            {[
              ["Controller", "ESP32"],
              ["Radar", "HLK-LD2420"],
              ["Camera", "CONNECTED"],
              ["Communication", "Wi-Fi"],
              ["Protocol", "MQTT / HTTP"],
              ["Battery", `${state.rover.battery.toFixed(0)}%`],
              ["GPS", state.rover.gpsStatus],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border py-1">
                <dt className="label-tech">{k}</dt>
                <dd className="value-tech text-[11px] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Rover Buffer" subtitle="Offline event storage">
          <div className="value-tech text-2xl font-bold">
            {state.bufferedEvents}
            <span className="label-tech ml-1">events waiting to sync</span>
          </div>
          <div className="label-tech mt-1">Last sync {agoLabel(state.lastSyncAt)}</div>
        </Panel>
      </div>
    </div>
  );
}
