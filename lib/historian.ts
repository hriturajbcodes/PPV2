import "server-only";
import sql from "mssql";
import { ALL_TAGS } from "@/config/tags";
import { THRESHOLDS } from "@/config/thresholds";
import { env } from "@/lib/env";
import type { DashboardSnapshot, HistorianValue, Quality } from "@/lib/types";

let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getPool() {
  if (!env.enabled) throw new Error("Historian is disabled");
  if (!env.username || !env.password) {
    throw new Error("PP_SQL_USERNAME and PP_SQL_PASSWORD are required");
  }

  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool({
      server: env.host,
      port: env.port,
      database: env.database,
      user: env.username,
      password: env.password,
      options: {
        encrypt: env.encrypt,
        trustServerCertificate: env.trustCert
      },
      pool: { min: 0, max: 5, idleTimeoutMillis: 30000 },
      connectionTimeout: 8000,
      requestTimeout: 12000
    }).connect().catch(error => {
      poolPromise = null;
      throw error;
    });
  }

  return poolPromise;
}

function quality(timestamp: Date | null, value: number | null): Quality {
  if (value === null || !timestamp) return "BAD";
  const ageSeconds = (Date.now() - timestamp.getTime()) / 1000;
  return ageSeconds > THRESHOLDS.staleAfterSeconds ? "STALE" : "GOOD";
}

function emptyValue(tag: string): HistorianValue {
  return { tag, value: null, timestamp: null, quality: "BAD" };
}

export function demoSnapshot(): DashboardSnapshot {
  const now = new Date().toISOString();
  const values = Object.fromEntries(
    ALL_TAGS.map(tag => [tag, { tag, value: null, timestamp: null, quality: "BAD" as const }])
  );
  return {
    source: "demo",
    state: "STANDBY",
    latencyMs: 0,
    generatedAt: now,
    values
  };
}

export async function fetchSnapshot(): Promise<DashboardSnapshot> {
  if (!env.enabled) return demoSnapshot();

  const started = performance.now();
  const pool = await getPool();
  const request = pool.request();

  ALL_TAGS.forEach((tag, i) => request.input(`tag${i}`, sql.NVarChar(255), tag));
  const placeholders = ALL_TAGS.map((_, i) => `@tag${i}`).join(", ");

  // SELECT-only by design. One query returns the latest row for every configured tag.
  const result = await request.query(`
    WITH latest AS (
      SELECT
        tag_name,
        MAX(ts_utc) AS ts_utc
      FROM ${env.view}
      WHERE asset_path = 'pp'
        AND tag_name IN (${placeholders})
      GROUP BY tag_name
    )
    SELECT
      l.tag_name,
      l.ts_utc,
      TRY_CONVERT(float, v.tag_value) AS numeric_value
    FROM latest l
    OUTER APPLY (
      SELECT TOP (1)
        x.tag_value
      FROM ${env.view} x
      WHERE x.asset_path = 'pp'
        AND x.tag_name = l.tag_name
        AND x.ts_utc = l.ts_utc
    ) v;
  `);

  const values: Record<string, HistorianValue> = Object.fromEntries(
    ALL_TAGS.map(tag => [tag, emptyValue(tag)])
  );

  for (const row of result.recordset as Array<{
    tag_name: string;
    ts_utc: Date | null;
    numeric_value: number | null;
  }>) {
    const ts = row.ts_utc ? new Date(row.ts_utc) : null;
    const value = row.numeric_value === null ? null : Number(row.numeric_value);
    values[row.tag_name] = {
      tag: row.tag_name,
      value,
      timestamp: ts?.toISOString() ?? null,
      quality: quality(ts, value)
    };
  }

  const goodCount = Object.values(values).filter(v => v.quality === "GOOD").length;
  return {
    source: "historian",
    state: goodCount > 0 ? "LIVE" : "DATA_UNAVAILABLE",
    latencyMs: Math.round(performance.now() - started),
    generatedAt: new Date().toISOString(),
    values
  };
}

export async function testHistorian() {
  if (!env.enabled) {
    return { connected: false, latencyMs: 0, message: "Historian disabled; demo mode active." };
  }
  const started = performance.now();
  const pool = await getPool();
  await pool.request().query("SELECT 1 AS ok;");
  return {
    connected: true,
    latencyMs: Math.round(performance.now() - started),
    message: "SQL Server connection successful."
  };
}
