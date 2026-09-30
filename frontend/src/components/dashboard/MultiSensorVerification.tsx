import { Camera, Check, Cpu, Minus, Radar, ShieldCheck } from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel } from "@/components/common/Panel";
import { cn } from "@/lib/utils";

export function MultiSensorVerification({ className }: { className?: string }) {
  const { state } = useRescueWave();
  const det = state.detections.find((d) => d.status !== "DISMISSED");

  const rows = [
    {
      icon: Radar,
      label: "Radar Sensor",
      description: "mmWave micro-doppler motion",
      ok: Boolean(det?.radarConfirmed),
      text: det ? (det.humanDetected ? "Human Motion Detected" : "Target Signature Present") : "No Contact",
    },
    {
      icon: Camera,
      label: "Visual Camera",
      description: "Thermal & optical verification",
      ok: Boolean(det?.cameraConfirmed),
      text: det?.cameraConfirmed ? "Visual Target Confirmed" : "Visual Match Pending",
    },
    {
      icon: Cpu,
      label: "Autonomous Model",
      description: "Edge neural inference",
      ok: Boolean(det && det.confidence >= 70),
      text: det ? `${det.confidence}% Confidence Rating` : "Inference Idle",
    },
  ];

  const status = !det
    ? "NO ACTIVE TARGET"
    : det.cameraConfirmed && det.confidence >= 70
      ? "POSSIBLE SURVIVOR"
      : "UNVERIFIED TARGET";

  return (
    <Panel className={className} title="Sensor Correlation" subtitle="Radar, Optical & AI multi-modal consensus">
      <ul className="space-y-2">
        {rows.map(({ icon: Icon, label, description, ok, text }) => (
          <li
            key={label}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-slate-50/60 p-2.5 transition-colors hover:bg-slate-100/60"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border",
                  ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-border bg-slate-100 text-muted-foreground"
                )}
              >
                <Icon className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground">{description}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  ok ? "text-emerald-700 font-semibold" : "text-muted-foreground"
                )}
              >
                {text}
              </span>
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border",
                  ok
                    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                    : "border-border bg-surface text-muted-foreground"
                )}
              >
                {ok ? <Check className="size-3" /> : <Minus className="size-3" />}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "mt-3 rounded-xl border p-3 transition-colors",
          status === "POSSIBLE SURVIVOR"
            ? "border-rose-200 bg-rose-50 text-rose-800"
            : status === "UNVERIFIED TARGET"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-border bg-slate-50 text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Consensus State:
          </span>
          <span className="text-xs font-bold capitalize ml-auto">
            {status.toLowerCase()}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed opacity-90">
          {status === "POSSIBLE SURVIVOR"
            ? "Multi-sensor agreement achieved. Target meets promotion criteria for operator confirmation."
            : status === "UNVERIFIED TARGET"
              ? "Secondary sensor confirmation needed before promoting target."
              : "All sensor streams nominal. Waiting for presence trigger."}
        </p>
      </div>
    </Panel>
  );
}
