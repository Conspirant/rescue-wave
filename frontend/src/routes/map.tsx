import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CommandMap } from "@/components/map/CommandMap";
import { MissionTimeline } from "@/components/dashboard/MissionTimeline";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { Panel } from "@/components/common/Panel";
import { useRescueWave } from "@/hooks/useRescueWave";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Map — RescueWave" },
      { name: "description", content: "Geospatial rover tracking, risk zones, survivor markers and waypoints." },
      { property: "og:title", content: "Live Map — RescueWave" },
      { property: "og:description", content: "Geospatial rover tracking, risk zones, survivor markers and waypoints." },
    ],
  }),
  component: LiveMapPage,
});

function LiveMapPage() {
  const [focus, setFocus] = useState<[number, number] | null>(null);
  const { state, actions } = useRescueWave();

  return (
    <div className="grid min-h-0 grid-cols-1 gap-2.5 xl:h-full xl:grid-cols-12">
      <CommandMap className="min-h-[560px] xl:col-span-9 xl:min-h-0" focus={focus} />
      <div className="flex flex-col gap-2.5 xl:col-span-3">
        <Panel title="Waypoints" subtitle={`${state.waypoints.length} assigned`} bodyClassName="p-2">
          <ul className="space-y-1">
            {state.waypoints.map((w) => (
              <li key={w.id} className="flex items-center justify-between rounded-sm border border-border px-2 py-1.5">
                <span className="value-tech text-[11px] font-bold">{w.label}</span>
                <span className="value-tech text-[11px] text-muted-foreground">
                  {w.latitude.toFixed(4)}, {w.longitude.toFixed(4)}
                </span>
                <button className="label-tech text-critical" onClick={() => actions.removeWaypoint(w.id)}>
                  Remove
                </button>
              </li>
            ))}
            {state.waypoints.length === 0 && (
              <li className="label-tech rounded-sm border border-dashed border-border p-3 text-center">
                Click the map to assign a waypoint
              </li>
            )}
          </ul>
        </Panel>
        <RiskPanel />
        <MissionTimeline className="max-h-96" onFocus={setFocus} />
      </div>
    </div>
  );
}
