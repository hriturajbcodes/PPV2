import { TAGS } from "@/config/tags";
import { THRESHOLDS } from "@/config/thresholds";
import type { DashboardSnapshot, HistorianValue, Quality } from "@/lib/types";

export function reading(snapshot: DashboardSnapshot | null, tag: string): HistorianValue {
  return snapshot?.values[tag] ?? { tag, value: null, timestamp: null, quality: "BAD" };
}

export function display(value: number | null, digits = 1) {
  return value === null || !Number.isFinite(value) ? "--" : value.toFixed(digits);
}

export function qualityLabel(quality: Quality) {
  return quality;
}

export function qualityClass(quality: Quality) {
  return quality === "GOOD" ? "quality-good" : quality === "STALE" ? "quality-stale" : "quality-bad";
}

export function moistureState(value: number | null) {
  if (value === null) return "BAD";
  if (value < THRESHOLDS.moisture.okMax) return "OK";
  if (value <= THRESHOLDS.moisture.warningMax) return "WARN";
  return "HIGH";
}

export function binState(value: number | null, quality: Quality) {
  if (quality !== "GOOD" || value === null) return "stale";
  if (value < THRESHOLDS.bins.starvingBelow) return "starving";
  if (value < THRESHOLDS.bins.lowBelow) return "low";
  if (value > THRESHOLDS.bins.normalMax) return "overfeed";
  return "normal";
}

export function binSummary(snapshot: DashboardSnapshot | null) {
  const rows = Object.entries(TAGS.bins).map(([name, tag]) => {
    const r = reading(snapshot, tag);
    return { name, tag, value: r.value, quality: r.quality, state: binState(r.value, r.quality) };
  });
  const reporting = rows.filter(x => x.quality === "GOOD" && x.value !== null);
  const average = reporting.length ? reporting.reduce((a,b)=>a+(b.value ?? 0),0)/reporting.length : null;
  const alerts = rows.filter(x => ["starving","low","overfeed"].includes(x.state));
  const starving = rows.filter(x => x.state === "starving");
  return { rows, reporting: reporting.length, average, alerts, starving };
}
