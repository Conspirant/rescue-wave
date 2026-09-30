import { useState } from "react";
import { Terminal, X } from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { API_BASE_URL, DEBUG_MODE, IS_MOCK_MODE } from "@/services/api";
import { clockTime } from "@/lib/format";

/** Developer drawer. Hidden unless VITE_DEBUG_MODE=true. */
export function DebugDrawer() {
  const { state } = useRescueWave();
  const [open, setOpen] = useState(false);
  if (!DEBUG_MODE) return null;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed right-3 bottom-3 z-[900] flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-1.5 shadow-raised"
      >
        <Terminal className="size-3.5" />
        <span className="label-tech">Debug</span>
      </button>
      {open && (
        <aside className="fixed right-0 bottom-0 z-[900] max-h-[60vh] w-full overflow-y-auto border-t border-l border-border bg-surface p-3 shadow-raised sm:w-96">
          <div className="flex items-center justify-between">
            <span className="label-tech">Developer Drawer</span>
            <button onClick={() => setOpen(false)} aria-label="Close debug drawer">
              <X className="size-3.5" />
            </button>
          </div>
          <dl className="value-tech mt-2 space-y-1 text-[11px]">
            {[
              ["API connection", IS_MOCK_MODE ? "MOCK (no VITE_API_BASE_URL)" : API_BASE_URL],
              ["Realtime channel", IS_MOCK_MODE ? "SIMULATION" : "PENDING"],
              ["Last telemetry", clockTime(state.lastTelemetryAt)],
              ["Active rover", state.rover.roverId],
              ["Active disaster", state.mission.disasterType],
              ["Mode", IS_MOCK_MODE ? "MOCK" : "LIVE"],
              ["Buffered events", String(state.bufferedEvents)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-border py-0.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="truncate font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <pre className="mt-2 max-h-48 overflow-auto rounded-sm border border-border bg-surface-muted p-2 text-[10px]">
            {JSON.stringify(state.rover, null, 2)}
          </pre>
        </aside>
      )}
    </>
  );
}
