import "server-only";
import { fetchSnapshot, demoSnapshot } from "@/lib/historian";
import type { DashboardSnapshot } from "@/lib/types";

const TTL_MS = 3000;
let cached: DashboardSnapshot | null = null;
let expiresAt = 0;
let inflight: Promise<DashboardSnapshot> | null = null;

export async function getDashboardSnapshot() {
  const now = Date.now();
  if (cached && now < expiresAt) return cached;
  if (inflight) return inflight;

  inflight = fetchSnapshot()
    .then(snapshot => {
      cached = snapshot;
      expiresAt = Date.now() + TTL_MS;
      return snapshot;
    })
    .catch(error => {
      console.error("Historian snapshot failed:", error);
      const fallback = demoSnapshot();
      fallback.state = "DATA_UNAVAILABLE";
      return fallback;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
