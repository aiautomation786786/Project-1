import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(sev: string) {
  switch (sev) {
    case "critical":
      return "bg-rose-100 text-rose-700 ring-rose-300";
    case "warning":
      return "bg-amber-100 text-amber-800 ring-amber-300";
    case "info":
    default:
      return "bg-sky-100 text-sky-700 ring-sky-300";
  }
}

export function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 65) return "text-amber-600";
  return "text-rose-600";
}

export function scoreRingColor(score: number) {
  if (score >= 85) return "stroke-emerald-500";
  if (score >= 65) return "stroke-amber-500";
  return "stroke-rose-500";
}
