"use client";

import { useEffect, useState } from "react";

type VisitorStats = {
  error?: string;
  onlineVisitors: number;
  visits24h: number;
  visitsToday?: number;
};

async function sendVisitorSignal(event: "visit" | "heartbeat") {
  const response = await fetch("/api/visitors", {
    body: JSON.stringify({
      event,
      path: window.location.pathname,
    }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = (await response.json()) as VisitorStats;

  if (!response.ok) {
    throw new Error(data.error || "访客统计更新失败");
  }

  return data;
}

export function VisitorStatsPanel() {
  const [stats, setStats] = useState<VisitorStats>({
    onlineVisitors: 0,
    visits24h: 0,
  });
  const [status, setStatus] = useState("正在统计");

  useEffect(() => {
    let isMounted = true;

    async function updateStats(event: "visit" | "heartbeat") {
      try {
        const nextStats = await sendVisitorSignal(event);

        if (!isMounted) {
          return;
        }

        setStats(nextStats);
        setStatus("实时");
      } catch {
        if (isMounted) {
          setStatus("暂不可用");
        }
      }
    }

    void updateStats("visit");
    const interval = window.setInterval(() => {
      void updateStats("heartbeat");
    }, 60_000);
    let midnightTimeout: number;
    function scheduleMidnightRefresh() {
      const dayMs = 24 * 60 * 60 * 1000;
      const untilMidnight = dayMs - ((Date.now() + 8 * 60 * 60 * 1000) % dayMs);
      midnightTimeout = window.setTimeout(() => {
        // Do not display yesterday's count while waiting for the next heartbeat.
        setStats((previous) => ({ ...previous, visitsToday: 0, visits24h: 0 }));
        void updateStats("heartbeat");
        scheduleMidnightRefresh();
      }, untilMidnight);
    }
    scheduleMidnightRefresh();

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.clearTimeout(midnightTimeout);
    };
  }, []);

  return (
    <div
      aria-label="站点实时访问概览"
      className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs font-medium text-muted"
    >
      <span className="whitespace-nowrap">
        今日访问人数{" "}
        <strong className="font-bold text-accent">
          {(stats.visitsToday ?? stats.visits24h).toLocaleString("zh-CN")}
        </strong>
      </span>
      <span className="whitespace-nowrap">
        当前在线人数{" "}
        <strong className="font-bold text-accent">
          {stats.onlineVisitors.toLocaleString("zh-CN")}
        </strong>
      </span>
      <span className="whitespace-nowrap text-[11px] font-semibold text-accent">
        {status}
      </span>
    </div>
  );
}
