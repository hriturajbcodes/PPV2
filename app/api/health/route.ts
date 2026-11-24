import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { testHistorian } from "@/lib/historian";
import type { HealthPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await testHistorian();
    const payload: HealthPayload = {
      ok: !env.enabled || result.connected,
      databaseEnabled: env.enabled,
      databaseConnected: result.connected,
      source: env.enabled && result.connected ? "historian" : "demo",
      latencyMs: result.latencyMs,
      checkedAt: new Date().toISOString(),
      message: result.message
    };
    return NextResponse.json(payload);
  } catch (error) {
    const payload: HealthPayload = {
      ok: false,
      databaseEnabled: env.enabled,
      databaseConnected: false,
      source: "demo",
      latencyMs: 0,
      checkedAt: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Unknown database error"
    };
    return NextResponse.json(payload, { status: 503 });
  }
}
