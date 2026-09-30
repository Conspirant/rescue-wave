import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel } from "@/components/common/Panel";
import { Input } from "@/components/ui/input";
import { useRescueWave } from "@/hooks/useRescueWave";
import { clockTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/types";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "Mission Log — RescueWave" },
      { name: "description", content: "Searchable mission history of rover events, detections and operator actions." },
      { property: "og:title", content: "Mission Log — RescueWave" },
      { property: "og:description", content: "Searchable mission history of rover events, detections and operator actions." },
    ],
  }),
  component: MissionLogPage,
});

const SEVERITIES: ("ALL" | AlertSeverity)[] = ["ALL", "CRITICAL", "WARNING", "INFO"];

function MissionLogPage() {
  const { state } = useRescueWave();
  const [sev, setSev] = useState<(typeof SEVERITIES)[number]>("ALL");
  const [q, setQ] = useState("");

  const rows = [...state.events]
    .reverse()
    .filter(
      (e) =>
        (sev === "ALL" || e.severity === sev) &&
        (q === "" || `${e.event} ${e.location} ${e.roverId}`.toLowerCase().includes(q.toLowerCase())),
    );

  return (
    <Panel
      title="Mission Log"
      subtitle={`${rows.length} events · operation ${state.mission.disasterType}`}
      bodyClassName="p-2 overflow-x-auto"
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {SEVERITIES.map((s) => (
          <button
            key={s}
            onClick={() => setSev(s)}
            className={cn(
              "label-tech rounded-sm border px-2 py-1",
              sev === s ? "border-primary bg-primary text-primary-foreground" : "border-border",
            )}
          >
            {s}
          </button>
        ))}
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events, zones, rover"
          className="ml-auto h-7 w-64 rounded-sm font-mono text-xs"
        />
      </div>

      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-border-strong">
            {["Time", "Event", "Rover", "Location", "Severity", "Status"].map((h) => (
              <th key={h} className="label-tech px-2 py-1.5 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="border-b border-border hover:bg-surface-muted">
              <td className="value-tech px-2 py-1.5 text-[11px]">{clockTime(e.time)}</td>
              <td className="value-tech px-2 py-1.5 text-[11px] font-semibold">{e.event}</td>
              <td className="value-tech px-2 py-1.5 text-[11px]">{e.roverId}</td>
              <td className="value-tech px-2 py-1.5 text-[11px]">{e.location}</td>
              <td className="px-2 py-1.5">
                <span
                  className={cn(
                    "label-tech rounded-sm border px-1.5 py-0.5",
                    e.severity === "CRITICAL"
                      ? "border-critical/40 bg-critical/10 text-critical"
                      : e.severity === "WARNING"
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : "border-accent/40 bg-accent/10 text-accent",
                  )}
                >
                  {e.severity}
                </span>
              </td>
              <td className="value-tech px-2 py-1.5 text-[11px]">{e.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
