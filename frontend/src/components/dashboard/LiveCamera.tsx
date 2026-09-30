import { useEffect, useState } from "react";
import { Camera, Radio } from "lucide-react";
import { Panel, StatusDot } from "@/components/common/Panel";
import { useRescueWave } from "@/hooks/useRescueWave";
import { elapsed } from "@/lib/format";

export function LiveCamera({ className, streamUrl }: { className?: string; streamUrl?: string }) {
  const { state } = useRescueWave();
  const [, tick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const det = state.detections.find((d) => d.status !== "DISMISSED" && d.cameraConfirmed);
  const live = state.rover.cameraStatus === "LIVE" && state.connection === "CONNECTED";

  return (
    <Panel
      className={className}
      title="Optical Video Feed"
      subtitle="HD Sensor Camera 01 (Forward Gimbal)"
      bodyClassName="p-2.5"
      actions={
        <span className="flex items-center gap-1.5 rounded-full border border-border/80 bg-surface-muted/50 px-2.5 py-0.5 text-xs font-medium">
          <StatusDot tone={live ? "critical" : "muted"} pulse={live} />
          <span className="text-foreground">{live ? "Live Stream" : "No Feed"}</span>
        </span>
      }
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/80 bg-slate-950 shadow-inner">
        {streamUrl ? (
          <img src={streamUrl} alt="Rover camera stream" className="h-full w-full object-cover" />
        ) : (
          <>
            {/* Tactical Grid Background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.4) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            {/* Scanline Sweep */}
            <div className="animate-scanline absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-sky-400/10 to-transparent pointer-events-none" />

            {/* Simulated Terrain Silhouette View */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500/80">
              <Camera className="size-10 mb-2 stroke-[1.5] text-slate-600" />
              <p className="text-xs font-medium text-slate-400">Tactical Optical Telemetry</p>
              <p className="text-[11px] text-slate-500">Autonomous stabilization active</p>
            </div>
          </>
        )}

        {/* HUD Tactical Overlays */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none text-xs text-slate-200">
          {/* Top Bar HUD */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[11px] font-medium">
              <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
              <span>REC {elapsed(state.mission.startedAt)}</span>
            </div>
            <div className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[11px] font-medium text-slate-300">
              CAM-01 · ROVER {state.rover.roverId}
            </div>
          </div>

          {/* Center Target Box when Detected */}
          {det && live && (
            <div className="absolute top-[32%] left-[36%] h-[40%] w-[28%] rounded-md border-2 border-rose-500 bg-rose-500/10 backdrop-blur-[1px]">
              <span className="value-tech absolute -top-5 left-0 rounded-t bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                TARGET ID: {det.targetId} ({det.confidence}%)
              </span>
            </div>
          )}

          {/* Bottom Bar HUD */}
          <div className="flex items-center justify-between">
            <div className="value-tech rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[11px] text-slate-300">
              GPS {state.rover.latitude.toFixed(4)}°N, {state.rover.longitude.toFixed(4)}°E
            </div>
            <div className="value-tech rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[11px] text-slate-300">
              {live ? "1080P · 30 FPS · STABLE" : "SIGNAL DEGRADED"}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
