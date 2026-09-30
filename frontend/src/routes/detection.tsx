import { createFileRoute } from "@tanstack/react-router";
import { DetectionRadar } from "@/components/dashboard/DetectionRadar";
import { MultiSensorVerification } from "@/components/dashboard/MultiSensorVerification";
import { LiveCamera } from "@/components/dashboard/LiveCamera";
import { Panel } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { useRescueWave } from "@/hooks/useRescueWave";
import { agoLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/detection")({
  head: () => ({
    meta: [
      { title: "Detection — RescueWave" },
      { name: "description", content: "Human-presence detection intelligence with radar, camera and AI verification." },
      { property: "og:title", content: "Detection — RescueWave" },
      { property: "og:description", content: "Human-presence detection intelligence with radar, camera and AI verification." },
    ],
  }),
  component: DetectionPage,
});

function DetectionPage() {
  const { state, actions } = useRescueWave();

  return (
    <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-12">
      <div className="flex flex-col gap-2.5 xl:col-span-8">
        <DetectionRadar />
        <LiveCamera />
      </div>
      <div className="flex flex-col gap-2.5 xl:col-span-4">
        <MultiSensorVerification />
        <Panel title="Target Register" subtitle="Operator verification required" bodyClassName="p-2">
          <ul className="space-y-1.5">
            {state.detections.map((d) => (
              <li key={d.targetId} className="rounded-sm border border-border px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="value-tech text-[11px] font-bold">{d.targetId}</span>
                  <span
                    className={cn(
                      "label-tech rounded-sm border px-1.5 py-0.5",
                      d.status === "VERIFIED"
                        ? "border-success/40 bg-success/10 text-success"
                        : d.status === "POSSIBLE_SURVIVOR"
                          ? "border-critical/40 bg-critical/10 text-critical"
                          : d.status === "DISMISSED"
                            ? "border-border text-muted-foreground"
                            : "border-caution/40 bg-caution/10 text-caution",
                    )}
                  >
                    {d.status.replace("_", " ")}
                  </span>
                </div>
                <div className="label-tech mt-1">
                  {d.confidence}% · {d.distance.toFixed(1)} m · motion {d.motion} · {agoLabel(d.timestamp)}
                </div>
                <div className="mt-1 flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 rounded-sm px-1.5"
                    onClick={() => actions.verifyTarget(d.targetId)}
                  >
                    <span className="label-tech text-inherit">Mark verified</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 rounded-sm px-1.5"
                    onClick={() => actions.dismissTarget(d.targetId)}
                  >
                    <span className="label-tech text-inherit">Dismiss</span>
                  </Button>
                </div>
              </li>
            ))}
            {state.detections.length === 0 && (
              <li className="label-tech rounded-sm border border-dashed border-border p-3 text-center">
                No targets registered in this mission
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
