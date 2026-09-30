import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Landmark, Mountain, Users } from "lucide-react";
import { Panel } from "@/components/common/Panel";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { useRescueWave } from "@/hooks/useRescueWave";
import { riskToneClass } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk Intelligence — RescueWave" },
      { name: "description", content: "Predict & prepare: high-risk zones, contributing factors and early warnings." },
      { property: "og:title", content: "Risk Intelligence — RescueWave" },
      { property: "og:description", content: "Predict & prepare: high-risk zones, contributing factors and early warnings." },
    ],
  }),
  component: RiskPage,
});

const SOURCES = [
  { icon: CloudRain, label: "Weather data", state: "NOT CONNECTED" },
  { icon: Landmark, label: "Historical disaster data", state: "NOT CONNECTED" },
  { icon: Mountain, label: "GIS / satellite", state: "NOT CONNECTED" },
  { icon: Users, label: "Citizen reports", state: "NOT CONNECTED" },
];

function RiskPage() {
  const { state } = useRescueWave();

  return (
    <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-12">
      <div className="flex flex-col gap-2.5 xl:col-span-8">
        <Panel title="High-Risk Zones" subtitle="Prototype values — no live prediction service is connected">
          <ul className="space-y-2">
            {state.risk.zones.map((z) => (
              <li key={z.id} className="rounded-sm border border-border px-2 py-2">
                <div className="flex items-center gap-2">
                  <span className="value-tech text-sm font-bold">{z.name}</span>
                  <span className={cn("label-tech rounded-sm border px-1.5 py-0.5", riskToneClass[z.level])}>
                    {z.level}
                  </span>
                  <span className="value-tech ml-auto text-lg font-bold">{z.probability}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-1.5 rounded-full",
                      z.level === "CRITICAL" ? "bg-critical" : z.level === "HIGH" ? "bg-warning" : z.level === "MODERATE" ? "bg-caution" : "bg-success",
                    )}
                    style={{ width: `${z.probability}%` }}
                  />
                </div>
                <div className="label-tech mt-1">Factors: {z.factors.join(" · ")}</div>
              </li>
            ))}
          </ul>
        </Panel>
        <RiskPanel />
      </div>

      <div className="flex flex-col gap-2.5 xl:col-span-4">
        <Panel title="Data Sources" subtitle="Planned inputs for the prediction layer">
          <ul className="space-y-1">
            {SOURCES.map(({ icon: Icon, label, state: s }) => (
              <li key={label} className="flex items-center gap-2 border-b border-border py-1.5">
                <Icon className="size-3.5 text-muted-foreground" />
                <span className="value-tech text-[11px] font-semibold">{label}</span>
                <span className="label-tech ml-auto">{s}</span>
              </li>
            ))}
          </ul>
          <p className="label-tech mt-2 leading-relaxed normal-case">
            The prediction layer is architected but not connected. Values shown are prototype data, not live forecasts.
          </p>
        </Panel>
        <Panel title="Purpose" subtitle="Predict & prepare stage">
          <ul className="value-tech space-y-1 text-[11px] text-muted-foreground">
            {[
              "Identify high-risk zones",
              "Prioritise vulnerable areas",
              "Issue early warnings",
              "Assist route planning",
              "Support resource allocation",
            ].map((t) => (
              <li key={t} className="border-b border-border py-1">
                {t}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
