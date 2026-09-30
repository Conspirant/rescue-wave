import { Link } from "@tanstack/react-router";
import { BellRing, Check, MapPin } from "lucide-react";
import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { agoLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AlertItem } from "@/types";

export function AlertRow({ alert }: { alert: AlertItem }) {
  const { actions } = useRescueWave();

  const severityBadge = {
    CRITICAL: "bg-rose-50 text-rose-700 border-rose-200",
    WARNING: "bg-amber-50 text-amber-800 border-amber-200",
    INFO: "bg-sky-50 text-sky-700 border-sky-200",
  }[alert.severity];

  const borderLeft = {
    CRITICAL: "border-l-rose-500",
    WARNING: "border-l-amber-500",
    INFO: "border-l-sky-500",
  }[alert.severity];

  return (
    <li
      className={cn(
        "group rounded-lg border border-border border-l-4 bg-surface p-2.5 transition-all duration-150 hover:bg-slate-50/70",
        borderLeft,
        alert.severity === "CRITICAL" && !alert.acknowledged && "bg-rose-50/40",
        alert.acknowledged && "opacity-60"
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", severityBadge)}>
          {alert.severity}
        </span>
        <span className="truncate text-xs font-semibold text-foreground">{alert.title}</span>
        <span className="ml-auto shrink-0 text-[11px] font-medium text-muted-foreground">{agoLabel(alert.timestamp)}</span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{alert.message}</p>

      <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
        <span className="truncate">
          {alert.location} · <span className="text-foreground/80">{alert.source}</span>
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 gap-1 rounded-md px-2 text-[11px] font-medium hover:bg-surface-muted"
            onClick={() => actions.acknowledgeAlert(alert.id)}
            disabled={alert.acknowledged}
          >
            <Check className="size-3" />
            <span>{alert.acknowledged ? "Acknowledged" : "Acknowledge"}</span>
          </Button>
          <Button asChild size="sm" variant="ghost" className="h-6 gap-1 rounded-md px-2 text-[11px] font-medium hover:bg-surface-muted">
            <Link to="/map">
              <MapPin className="size-3" />
              <span>Map</span>
            </Link>
          </Button>
        </div>
      </div>
    </li>
  );
}

export function AlertCenter({ className, limit = 6 }: { className?: string; limit?: number }) {
  const { state, actions } = useRescueWave();
  const unack = state.alerts.filter((a) => !a.acknowledged).length;

  return (
    <Panel
      className={className}
      title="Alert Center"
      subtitle={`${unack} active notification${unack === 1 ? "" : "s"} requiring attention`}
      bodyClassName="p-2.5 overflow-y-auto"
      actions={
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 rounded-lg border-border/70 bg-surface-muted/40 px-2.5 text-xs font-medium hover:bg-surface-muted"
          onClick={() => actions.acknowledgeAll()}
        >
          <BellRing className="size-3 text-muted-foreground" />
          <span>Acknowledge All</span>
        </Button>
      }
    >
      <ul className="space-y-2">
        {state.alerts.slice(0, limit).map((a) => (
          <AlertRow key={a.id} alert={a} />
        ))}
      </ul>
    </Panel>
  );
}
