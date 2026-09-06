"use client";

import { useEffect, useState } from "react";

type VisitorStats = {
  error?: string;
  onlineVisitors: number;
  visits24h: number;
};

const visitorStorageKey = "robot-forum-visitor-id";

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 14)}`;
}

function getVisitorId() {
  try {
    const existing = localStorage.getItem(visitorStorageKey);

    if (existing) {
      return existing;
    }

    const nextId = createVisitorId();
    localStorage.setItem(visitorStorageKey, nextId);

    return nextId;
  } catch {
    return createVisitorId();
  }
}

async function sendVisitorSignal(event: "visit" | "heartbeat") {
  const response = await fetch("/api/visitors", {
    body: JSON.stringify({
      event,
      path: window.location.pathname,
      visitorId: getVisitorId(),
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

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      aria-label="站点实时访问概览"
      className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs font-medium text-[#667085]"
    >
      <span className="whitespace-nowrap">
        24H访问人数{" "}
        <strong className="font-bold text-[#1f8a70]">
          {stats.visits24h.toLocaleString("zh-CN")}
        </strong>
      </span>
      <span className="whitespace-nowrap">
        当前在线人数{" "}
        <strong className="font-bold text-[#d04f1f]">
          {stats.onlineVisitors.toLocaleString("zh-CN")}
        </strong>
      </span>
      <span className="whitespace-nowrap text-[11px] font-semibold text-[#24706f]">
        {status}
      </span>
    </div>
  );
}
