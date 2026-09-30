import type { AlertSeverity, RiskLevel } from "@/types";

export const clockTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export const shortTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export function elapsed(fromTs: number, toTs = Date.now()) {
  const total = Math.max(0, Math.floor((toTs - fromTs) / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function agoLabel(ts: number) {
  const sec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec} sec ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  return `${Math.round(min / 60)} hr ago`;
}

export function compass(heading: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(heading / 45) % 8];
}

export const headingLabel = (heading: number) =>
  `${String(Math.round(heading)).padStart(3, "0")}° ${compass(heading)}`;

export const riskToneClass: Record<RiskLevel, string> = {
  LOW: "text-success border-success/40 bg-success/10",
  MODERATE: "text-caution border-caution/40 bg-caution/10",
  HIGH: "text-warning border-warning/40 bg-warning/10",
  CRITICAL: "text-critical border-critical/40 bg-critical/10",
};

export const severityToneClass: Record<AlertSeverity, string> = {
  CRITICAL: "text-critical border-critical/40 bg-critical/10",
  WARNING: "text-warning border-warning/40 bg-warning/10",
  INFO: "text-accent border-accent/40 bg-accent/10",
};
