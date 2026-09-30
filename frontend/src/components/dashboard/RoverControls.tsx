import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Home, MapPin, Octagon, Play } from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel, StatusDot } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import type { RoverMode } from "@/types";

export function RoverControls({ className }: { className?: string }) {
  const { state, actions } = useRescueWave();
  const [confirm, setConfirm] = useState<null | "RETURN" | "STOP">(null);

  const dirBtn = (label: string, heading: number, Icon: typeof ArrowUp) => (
    <Button
      key={label}
      variant="outline"
      size="icon"
      aria-label={label}
      className="size-10 rounded-xl border-border bg-white text-slate-700 transition-all hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 shadow-xs"
      onClick={() => actions.nudge(heading)}
    >
      <Icon className="size-4" />
    </Button>
  );

  return (
    <Panel
      className={className}
      title="Rover Manual Flight & Drive Deck"
      subtitle={`Unit ${state.rover.roverId} · Safety override interlocks active`}
      actions={
        <span className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <StatusDot tone={state.rover.status === "MOVING" ? "accent" : "muted"} pulse />
          <span className="capitalize">{state.rover.status.toLowerCase()}</span>
        </span>
      }
    >
      <div className="flex flex-wrap items-center gap-6">
        {/* D-Pad Directional Controller */}
        <div className="rounded-2xl border border-border bg-slate-50/70 p-2.5 shadow-inner">
          <div className="grid grid-cols-3 gap-1.5">
            <span />
            {dirBtn("Forward", 0, ArrowUp)}
            <span />
            {dirBtn("Left", 270, ArrowLeft)}
            <Button
              variant="secondary"
              size="icon"
              className="size-10 rounded-xl border border-border bg-white shadow-xs"
              aria-label="Hold Position"
              onClick={() => actions.setRoverStatus("IDLE")}
              title="Hold Position"
            >
              <span className="size-2.5 rounded-full bg-sky-600 ring-2 ring-sky-300" />
            </Button>
            {dirBtn("Right", 90, ArrowRight)}
            <span />
            {dirBtn("Reverse", 180, ArrowDown)}
            <span />
          </div>
        </div>

        {/* Operating Modes & Throttle */}
        <div className="min-w-56 flex-1 space-y-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Autonomy Operating Mode</span>
            <div className="mt-1.5 flex gap-1.5">
              {(["AUTO", "ASSISTED", "MANUAL"] as RoverMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => actions.setMode(m)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 capitalize",
                    state.rover.mode === m
                      ? "border-sky-300 bg-sky-50 text-sky-800 font-semibold shadow-xs"
                      : "border-border bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {m.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Speed Governor Limit</span>
              <span className="value-tech font-bold text-sky-700">{state.rover.speed.toFixed(1)} m/s</span>
            </div>
            <div className="mt-2">
              <Slider
                value={[state.rover.speed]}
                min={0}
                max={2}
                step={0.1}
                onValueChange={([v]) => actions.setSpeed(v ?? 0)}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>0.0 m/s (Crawl)</span>
              <span>2.0 m/s (Sprint)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 rounded-lg px-3 text-xs font-medium shadow-sm"
              onClick={() => setConfirm("STOP")}
            >
              <Octagon className="size-3.5" /> Emergency Halt
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg border-border/80 bg-surface-muted/40 px-3 text-xs font-medium hover:bg-surface-muted"
              onClick={() => setConfirm("RETURN")}
            >
              <Home className="size-3.5 text-sky-400" /> Return to Base
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg border-border/80 bg-surface-muted/40 px-3 text-xs font-medium hover:bg-surface-muted"
              onClick={() => actions.addWaypoint(state.rover.latitude + 0.0002, state.rover.longitude + 0.0002)}
            >
              <MapPin className="size-3.5 text-amber-400" /> Quick Waypoint
            </Button>
          </div>
        </div>
      </div>

      {/* Safety Interlock Confirmation Dialog */}
      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent className="rounded-xl border-border bg-surface text-foreground shadow-raised">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              {confirm === "RETURN" ? "Confirm Return to Base Command" : "Confirm Emergency Halt"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {confirm === "RETURN"
                ? "This will cancel current autonomous search patterns and instruct Rover RW-01 to backtrack along safe surveyed trails to the staging area."
                : "This command triggers immediate motor braking and disengages the drive train. Manual restart will be required."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                "rounded-lg font-medium text-white",
                confirm === "STOP" ? "bg-rose-600 hover:bg-rose-500" : "bg-sky-600 hover:bg-sky-500"
              )}
              onClick={() => {
                if (confirm === "RETURN") actions.returnToBase();
                else actions.setRoverStatus("STOPPED");
                setConfirm(null);
              }}
            >
              Confirm Command
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}
