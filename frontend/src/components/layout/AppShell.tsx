import type { ReactNode } from "react";
import { RadioTower } from "lucide-react";
import { CommandBar } from "./CommandBar";
import { NavRail } from "./NavRail";
import { MissionStrip } from "./MissionStrip";
import { DebugDrawer } from "./DebugDrawer";
import { RescueWaveProvider } from "@/hooks/useRescueWave";
import { useHydrated } from "@/hooks/useHydrated";
import { Toaster } from "@/components/ui/sonner";

function BootScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
      <span className="flex size-10 animate-pulse items-center justify-center rounded-sm bg-primary text-primary-foreground">
        <RadioTower className="size-5" />
      </span>
      <p className="label-tech">RescueWave · establishing telemetry link</p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  // Every panel renders live, clock-driven telemetry. Rendering it on the
  // server would always disagree with the browser a moment later, so the
  // command center mounts after hydration.
  const hydrated = useHydrated();
  if (!hydrated) return <BootScreen />;

  return (
    <RescueWaveProvider>
      <div className="flex h-screen min-h-0 flex-col bg-background">
        <CommandBar />
        <MissionStrip />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <NavRail />
          <main className="min-h-0 flex-1 overflow-y-auto p-2.5">{children}</main>
        </div>
        <DebugDrawer />
        <Toaster position="bottom-left" />
      </div>
    </RescueWaveProvider>
  );
}
