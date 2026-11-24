export type Quality = "GOOD" | "STALE" | "BAD";

export interface HistorianValue {
  tag: string;
  value: number | null;
  timestamp: string | null;
  quality: Quality;
}

export interface DashboardSnapshot {
  source: "historian" | "demo";
  state: "LIVE" | "STANDBY" | "DATA_UNAVAILABLE";
  latencyMs: number;
  generatedAt: string;
  values: Record<string, HistorianValue>;
}

export interface HealthPayload {
  ok: boolean;
  databaseEnabled: boolean;
  databaseConnected: boolean;
  source: "historian" | "demo";
  latencyMs: number;
  checkedAt: string;
  message: string;
}
