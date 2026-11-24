"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardSnapshot } from "@/lib/types";

export function useDashboard() {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (paused) return;
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      if (!response.ok) throw new Error(`Dashboard API ${response.status}`);
      const payload = await response.json() as DashboardSnapshot;
      if (mounted.current) setData(payload);
    } catch (error) {
      console.error(error);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [paused]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const timer = window.setInterval(refresh, 3000);
    return () => { mounted.current = false; window.clearInterval(timer); };
  }, [refresh]);

  return { data, paused, setPaused, loading, refresh };
}
