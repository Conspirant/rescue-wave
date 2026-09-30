import { useRescueWave } from "@/hooks/useRescueWave";
import { Panel } from "@/components/common/Panel";
import { shortTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MissionTimeline({
  className,
  onFocus,
}: {
  className?: string;
  onFocus?: (position: [number, number]) => void;
}) {
  const { state } = useRescueWave();
  const events = [...state.events].reverse().slice(0, 12);

  return (
    <Panel
      className={className}
      title="Incident Event Log"
      subtitle="Select an entry to re-center the map"
      bodyClassName="p-2.5 overflow-y-auto"
    >
      <ol className="relative space-y-1.5 pl-3 border-l border-border/80">
        {events.map((e) => (
          <li key={e.id} className="relative">
            <button
              onClick={() => e.position && onFocus?.(e.position)}
              className="group flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-surface-muted/60"
            >
              <span
                className={cn(
                  "absolute -left-[17px] top-3.5 size-2 rounded-full ring-4 ring-surface",
                  e.severity === "CRITICAL"
                    ? "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]"
                    : e.severity === "WARNING"
                      ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]"
                      : "bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.4)]"
                )}
              />
              <span className="value-tech w-12 shrink-0 pt-0.5 text-[11px] font-medium text-muted-foreground">
                {shortTime(e.time)}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-foreground group-hover:text-sky-600 transition-colors">
                  {e.event}
                </span>
                {e.detail && <span className="block text-[11px] text-muted-foreground mt-0.5">{e.detail}</span>}
              </div>
            </button>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
