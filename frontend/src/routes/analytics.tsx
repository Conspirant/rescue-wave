import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText, Boxes, ClipboardCheck, Layers3 } from "lucide-react";
import { Panel, Readout } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { buildAnalytics } from "@/services";
import { useRescueWave } from "@/hooks/useRescueWave";
import { elapsed } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — RescueWave" },
      { name: "description", content: "Post-mission analytics: coverage, detections, battery use and response timeline." },
      { property: "og:title", content: "Analytics — RescueWave" },
      { property: "og:description", content: "Post-mission analytics: coverage, detections, battery use and response timeline." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { state } = useRescueWave();
  const a = useMemo(() => buildAnalytics(), [state]);

  return (
    <div className="flex flex-col gap-2.5">
      <Panel title="Mission Summary" subtitle={`${state.mission.missionId} · ${state.mission.disasterType}`}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <Readout label="Duration" value={elapsed(state.mission.startedAt)} />
          <Readout label="Distance" value={a.distanceTravelled.toFixed(0)} unit="m" />
          <Readout label="Battery used" value={a.batteryConsumed.toFixed(1)} unit="%" />
          <Readout label="Detections" value={a.detections} />
          <Readout label="Verified" value={a.verifiedTargets} tone="success" />
          <Readout label="Unverified" value={a.unverifiedTargets} tone="warning" />
          <Readout label="Area coverage" value={a.areaCoverage} unit="%" />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
        <Panel title="Battery Consumption" bodyClassName="p-2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={a.batteryHistory}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} width={26} />
              <Tooltip contentStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
              <Area dataKey="battery" stroke="var(--color-chart-4)" fill="var(--color-chart-4)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Detection Confidence" bodyClassName="p-2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={a.detectionHistory}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} width={26} />
              <Tooltip contentStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
              <Line dataKey="confidence" stroke="var(--color-chart-5)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Alerts by Severity" bodyClassName="p-2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={a.alertsBySeverity}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="severity" tick={{ fontSize: 9 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 9 }} width={26} />
              <Tooltip contentStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
              <Bar dataKey="count" fill="var(--color-chart-2)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Respond & Learn" subtitle="Post-mission actions">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: FileText, label: "Generate incident report" },
            { icon: Layers3, label: "Damage assessment" },
            { icon: Boxes, label: "Resource requirements" },
            { icon: ClipboardCheck, label: "Mission summary" },
          ].map(({ icon: Icon, label }) => (
            <Button
              key={label}
              variant="outline"
              className="h-auto justify-start gap-2 rounded-sm py-3"
              onClick={() => toast.info(`${label} queued`, { description: "Report generation is a prototype placeholder." })}
            >
              <Icon className="size-4 text-accent" />
              <span className="label-tech text-inherit">{label}</span>
            </Button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
