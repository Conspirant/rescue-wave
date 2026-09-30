import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
  dense,
}: {
  title?: string | undefined;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  bodyClassName?: string | undefined;
  dense?: boolean | undefined;
}) {
  return (
    <section className={cn("panel flex min-h-0 flex-col overflow-hidden bg-surface border border-border/80 shadow-panel rounded-xl", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-border/70 bg-surface px-3.5 py-2.5">
          <div className="min-w-0">
            {title && (
              <h2 className="text-xs font-semibold tracking-wider text-foreground/95 uppercase truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[11px] font-normal text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", dense ? "p-2.5" : "p-3.5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatusDot({
  tone = "success",
  pulse,
  className,
}: {
  tone?: "success" | "warning" | "critical" | "muted" | "accent";
  pulse?: boolean;
  className?: string;
}) {
  const toneClass = {
    success: "bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]",
    warning: "bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.4)]",
    critical: "bg-rose-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]",
    muted: "bg-slate-400",
    accent: "bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.4)]",
  }[tone];

  return (
    <span className="relative inline-flex items-center justify-center size-2 shrink-0">
      {pulse && (
        <span
          className={cn(
            "absolute -inset-0.5 rounded-full animate-ping opacity-60",
            toneClass
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-block size-2 rounded-full",
          toneClass,
          className
        )}
        aria-hidden
      />
    </span>
  );
}

export function Readout({
  label,
  value,
  unit,
  tone,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  tone?: "default" | "success" | "warning" | "critical" | "accent";
  hint?: string;
  className?: string;
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-emerald-700",
    warning: "text-amber-800",
    critical: "text-rose-700",
    accent: "text-sky-700",
  }[tone ?? "default"];

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-lg border border-border bg-slate-50/60 p-2.5 transition-all duration-150 hover:bg-slate-100/60 hover:border-border-strong",
        className
      )}
    >
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className={cn("value-tech mt-1 text-base leading-tight font-semibold tracking-tight", toneClass)}>
        {value}
        {unit && <span className="ml-1 text-[11px] font-medium text-muted-foreground">{unit}</span>}
      </div>
      {hint && <div className="value-tech mt-1 text-[10px] text-muted-foreground/80 truncate">{hint}</div>}
    </div>
  );
}
