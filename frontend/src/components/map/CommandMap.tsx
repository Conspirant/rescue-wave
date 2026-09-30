import { lazy, Suspense, useEffect, useState } from "react";
import { Crosshair, Layers, MapPin, Navigation } from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel, StatusDot } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { MapLayers } from "./MapCanvas";

const MapCanvas = lazy(() => import("./MapCanvas"));

const LAYER_LABELS: { key: keyof MapLayers; label: string }[] = [
  { key: "risk", label: "Risk Zones" },
  { key: "detection", label: "Detections" },
  { key: "trail", label: "Rover Trail" },
  { key: "waypoints", label: "Waypoints" },
  { key: "terrain", label: "Terrain Layer" },
];

export function CommandMap({ className, focus }: { className?: string; focus?: [number, number] | null }) {
  const { state, actions } = useRescueWave();
  const [mounted, setMounted] = useState(false);
  const [follow, setFollow] = useState(true);
  const [layers, setLayers] = useState<MapLayers>({
    risk: true,
    detection: true,
    trail: true,
    waypoints: true,
    terrain: false,
  });
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => setMounted(true), []);

  const distance = pending
    ? Math.hypot(
        (pending.lat - state.rover.latitude) * 111_320,
        (pending.lng - state.rover.longitude) * 109_000,
      )
    : 0;

  return (
    <Panel
      className={cn("overflow-hidden rounded-xl", className)}
      title="Tactical Mission Map"
      subtitle={`${state.rover.latitude.toFixed(5)}°N, ${state.rover.longitude.toFixed(5)}°E · Sector ${state.mission.zone}`}
      bodyClassName="p-0 relative"
      actions={
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Click map to dispatch waypoint
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-400">
            <StatusDot tone={state.connection === "CONNECTED" ? "success" : "critical"} pulse />
            <span>{state.connection === "CONNECTED" ? "GPS Live" : "Degraded"}</span>
          </span>
        </div>
      }
    >
      <div className="relative h-full min-h-96 w-full">
        {mounted ? (
          <Suspense fallback={<div className="grid-backdrop h-full w-full bg-slate-950 flex items-center justify-center text-xs text-muted-foreground">Loading Tactical Map...</div>}>
            <MapCanvas
              layers={layers}
              follow={follow}
              focus={focus ?? null}
              onPickLocation={(lat, lng) => setPending({ lat, lng })}
            />
          </Suspense>
        ) : (
          <div className="grid-backdrop h-full w-full bg-slate-950" />
        )}

        {/* Floating Map Controls & Overlays */}
        <div className="pointer-events-none absolute inset-0 z-[500] flex flex-col justify-between p-3">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 pl-12">
            {/* Recenter Button */}
            <div className="rounded-xl border border-border/80 bg-slate-900/90 p-1 backdrop-blur-md shadow-lg">
              <Button
                size="sm"
                variant={follow ? "default" : "ghost"}
                className={cn(
                  "h-7 gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all",
                  follow ? "bg-sky-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setFollow((f) => !f)}
              >
                <Crosshair className="size-3.5" />
                <span>{follow ? "Following Rover" : "Recenter Rover"}</span>
              </Button>
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-slate-900/90 p-1 backdrop-blur-md shadow-lg">
              <div className="flex items-center px-2 text-muted-foreground">
                <Layers className="size-3.5" />
              </div>
              {LAYER_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
                  className={cn(
                    "rounded-lg px-2 py-1 text-xs font-medium transition-all duration-150",
                    layers[key]
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      : "text-muted-foreground hover:bg-slate-800 hover:text-foreground"
                  )}
                  aria-pressed={layers[key]}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Map Stats */}
          <div className="pointer-events-auto flex items-end justify-between gap-2">
            <div className="rounded-xl border border-border/80 bg-slate-900/90 px-3 py-1.5 backdrop-blur-md shadow-lg">
              <span className="text-[10px] font-medium text-muted-foreground">Map Scale</span>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="block h-1.5 w-16 rounded-sm border-x border-b border-sky-400" />
                <span className="value-tech text-xs font-semibold text-foreground">50 m</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-slate-900/90 px-3 py-1.5 backdrop-blur-md shadow-lg text-right">
              <span className="text-[10px] font-medium text-muted-foreground">Tactical Summary</span>
              <div className="value-tech mt-0.5 text-xs font-bold text-foreground">
                {state.detections.filter((d) => d.status !== "DISMISSED").length} Contacts · {state.waypoints.length} Active Waypoints
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Adding Waypoint */}
      <AlertDialog open={Boolean(pending)} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent className="rounded-xl border-border bg-surface text-foreground shadow-raised">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-sky-400">
              <Navigation className="size-5" />
              <AlertDialogTitle className="text-base font-bold">Deploy Rover Waypoint</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="mt-2 space-y-2 rounded-lg border border-border/70 bg-surface-muted/40 p-3 text-xs text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Coordinates:</span>
                  <span className="value-tech font-semibold">
                    {pending?.lat.toFixed(5)}°N, {pending?.lng.toFixed(5)}°E
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direct Range:</span>
                  <span className="value-tech font-semibold text-sky-400">{distance.toFixed(1)} metres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Arrival:</span>
                  <span className="value-tech font-semibold text-emerald-400">
                    ~{Math.max(1, Math.round(distance / Math.max(0.3, state.rover.speed)))} seconds
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium"
              onClick={() => {
                if (pending) actions.addWaypoint(pending.lat, pending.lng);
                setPending(null);
              }}
            >
              Confirm Dispatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}
