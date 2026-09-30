import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertRow } from "@/components/dashboard/AlertCenter";
import { Panel } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRescueWave } from "@/hooks/useRescueWave";
import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/types";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — RescueWave" },
      { name: "description", content: "Event-based alert center with severity, source and acknowledgement state." },
      { property: "og:title", content: "Alerts — RescueWave" },
      { property: "og:description", content: "Event-based alert center with severity, source and acknowledgement state." },
    ],
  }),
  component: AlertsPage,
});

const FILTERS: ("ALL" | AlertSeverity)[] = ["ALL", "CRITICAL", "WARNING", "INFO"];

function AlertsPage() {
  const { state, actions } = useRescueWave();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [q, setQ] = useState("");

  const alerts = state.alerts.filter(
    (a) =>
      (filter === "ALL" || a.severity === filter) &&
      (q === "" || `${a.title} ${a.message} ${a.location}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <Panel
      title="Alert Center"
      subtitle={`${state.alerts.filter((a) => !a.acknowledged).length} unacknowledged of ${state.alerts.length}`}
      bodyClassName="p-2"
      actions={
        <Button size="sm" variant="outline" className="h-7 rounded-sm" onClick={() => actions.acknowledgeAll()}>
          <span className="label-tech text-inherit">Acknowledge all</span>
        </Button>
      }
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "label-tech rounded-sm border px-2 py-1",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border",
            )}
          >
            {f}
          </button>
        ))}
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search alerts"
          className="ml-auto h-7 w-56 rounded-sm font-mono text-xs"
        />
      </div>
      <ul className="space-y-1.5">
        {alerts.map((a) => (
          <AlertRow key={a.id} alert={a} />
        ))}
        {alerts.length === 0 && (
          <li className="label-tech rounded-sm border border-dashed border-border p-4 text-center">No alerts match</li>
        )}
      </ul>
    </Panel>
  );
}
