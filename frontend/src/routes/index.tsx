import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IncidentKpiStrip } from "@/components/dashboard/IncidentKpiStrip";
import { CommandMap } from "@/components/map/CommandMap";
import { RoverTelemetryPanel } from "@/components/dashboard/RoverTelemetryPanel";
import { DetectionRadar } from "@/components/dashboard/DetectionRadar";
import { MultiSensorVerification } from "@/components/dashboard/MultiSensorVerification";
import { LiveCamera } from "@/components/dashboard/LiveCamera";
import { AlertCenter } from "@/components/dashboard/AlertCenter";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { MissionTimeline } from "@/components/dashboard/MissionTimeline";
import { SystemHealth } from "@/components/dashboard/SystemHealth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — RescueWave Command Center" },
      {
        name: "description",
        content: "Primary mission-control screen: rover position, telemetry, human detection, risk and alerts.",
      },
      { property: "og:title", content: "Overview — RescueWave Command Center" },
      {
        property: "og:description",
        content: "Primary mission-control screen: rover position, telemetry, human detection, risk and alerts.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const [focus, setFocus] = useState<[number, number] | null>(null);

  return (
    <div className="flex flex-col gap-2.5 md:gap-3">
      {/* Top Incident Status KPI Strip */}
      <IncidentKpiStrip />

      {/* Main Dashboard Layout */}
      <div className="grid min-h-0 grid-cols-1 gap-2.5 xl:grid-cols-12 md:gap-3">
        {/* Left Primary Operations Column */}
        <div className="flex min-h-0 flex-col gap-2.5 xl:col-span-8 md:gap-3">
          <CommandMap className="min-h-[300px] md:min-h-[420px] flex-1" focus={focus} />
          <RoverTelemetryPanel />
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 md:gap-3">
            <DetectionRadar />
            <LiveCamera />
          </div>
        </div>

        {/* Right Secondary Intel Column */}
        <div className="flex min-h-0 flex-col gap-2.5 xl:col-span-4 md:gap-3">
          <AlertCenter className="max-h-96" />
          <MultiSensorVerification />
          <RiskPanel />
          <MissionTimeline className="max-h-80" onFocus={setFocus} />
          <SystemHealth />
        </div>
      </div>
    </div>
  );
}
