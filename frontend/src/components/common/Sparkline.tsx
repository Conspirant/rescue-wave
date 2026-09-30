import { cn } from "@/lib/utils";

export function Sparkline({
  values,
  className,
  tone = "accent",
}: {
  values: number[];
  className?: string;
  tone?: "accent" | "success" | "warning" | "critical";
}) {
  const data = values.length > 1 ? values.slice(-30) : [0, 0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 24 - 2}`)
    .join(" ");
  const stroke = {
    accent: "stroke-accent",
    success: "stroke-success",
    warning: "stroke-warning",
    critical: "stroke-critical",
  }[tone];

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className={cn("h-7 w-full", className)} aria-hidden>
      <polyline points={points} fill="none" className={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
