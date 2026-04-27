import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(sev: string) {
  switch (sev) {
    case "critical":
      return "bg-rose-500/15 text-rose-300 ring-rose-500/30";
    case "warning":
      return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
    case "info":
    default:
      return "bg-sky-500/15 text-sky-300 ring-sky-500/30";
  }
}

export function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-400";
  if (score >= 65) return "text-amber-400";
  return "text-rose-400";
}

export function scoreRingColor(score: number) {
  if (score >= 85) return "stroke-emerald-400";
  if (score >= 65) return "stroke-amber-400";
  return "stroke-rose-400";
}
