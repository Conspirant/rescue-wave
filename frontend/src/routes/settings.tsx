import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRescueWave } from "@/hooks/useRescueWave";
import { API_BASE_URL, DEBUG_MODE, ENDPOINTS, IS_MOCK_MODE } from "@/services/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — RescueWave" },
      { name: "description", content: "Data source, connection simulation and integration settings for the command center." },
      { property: "og:title", content: "Settings — RescueWave" },
      { property: "og:description", content: "Data source, connection simulation and integration settings for the command center." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, actions } = useRescueWave();
  const connected = state.connection === "CONNECTED";

  return (
    <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
      <Panel title="Data Source" subtitle="Backend integration">
        <dl className="space-y-1">
          {[
            ["Mode", IS_MOCK_MODE ? "MOCK / SIMULATION" : "LIVE BACKEND"],
            ["VITE_API_BASE_URL", API_BASE_URL || "not set"],
            ["VITE_DEBUG_MODE", DEBUG_MODE ? "true" : "false"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-border py-1.5">
              <dt className="label-tech">{k}</dt>
              <dd className="value-tech truncate text-[11px] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="label-tech mt-2 normal-case">
          Set VITE_API_BASE_URL to route every service call to the real backend. No UI changes are required.
        </p>
      </Panel>

      <Panel title="Endpoint Map" subtitle="Single source of truth for the backend team">
        <dl className="space-y-1">
          {Object.entries(ENDPOINTS).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border py-1.5">
              <dt className="label-tech">{k}</dt>
              <dd className="value-tech text-[11px] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel title="Connection Simulation" subtitle="Test offline and buffered-sync behaviour">
        <div className="flex items-center justify-between border-b border-border py-2">
          <span className="value-tech text-[11px] font-semibold">Telemetry link</span>
          <div className="flex items-center gap-2">
            <span className="label-tech">{state.connection}</span>
            <Switch
              checked={connected}
              onCheckedChange={(v) => actions.setConnection(v ? "CONNECTED" : "OFFLINE")}
            />
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="value-tech text-[11px] font-semibold">Buffered rover events</span>
          <span className="value-tech text-[11px]">{state.bufferedEvents}</span>
        </div>
      </Panel>

      <Panel title="Mission" subtitle="Demo controls">
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-sm"
            variant={state.demoRunning ? "destructive" : "default"}
            onClick={() => (state.demoRunning ? actions.stopDemo() : actions.startDemo())}
          >
            <span className="label-tech text-inherit">{state.demoRunning ? "Stop demo" : "Run full demo sequence"}</span>
          </Button>
          <Button variant="outline" className="rounded-sm" onClick={() => actions.reset()}>
            <span className="label-tech text-inherit">Reset mission state</span>
          </Button>
        </div>
        <p className="label-tech mt-2 normal-case">
          The demo runs the complete rescue sequence through the same components and data contracts used in live mode.
        </p>
      </Panel>
    </div>
  );
}
