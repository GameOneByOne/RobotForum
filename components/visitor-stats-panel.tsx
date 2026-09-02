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
    <section className="border-b border-[#d8dee6] bg-[#fbfcfd]">
      <div className="mx-auto grid w-[80vw] max-w-none gap-4 px-5 py-5 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold text-[#24706f]">访客信息</p>
          <h2 className="mt-1 text-xl font-bold">站点实时访问概览</h2>
        </div>

        <div className="rounded-lg border border-[#d8dee6] bg-white px-5 py-4">
          <p className="text-xs font-semibold text-[#667085]">24H 访问人次</p>
          <p className="mt-1 text-3xl font-bold text-[#171a20]">
            {stats.visits24h.toLocaleString("zh-CN")}
          </p>
        </div>

        <div className="rounded-lg border border-[#d8dee6] bg-white px-5 py-4">
          <p className="text-xs font-semibold text-[#667085]">当前在线人数</p>
          <div className="mt-1 flex items-end gap-3">
            <p className="text-3xl font-bold text-[#171a20]">
              {stats.onlineVisitors.toLocaleString("zh-CN")}
            </p>
            <span className="pb-1 text-xs font-semibold text-[#24706f]">
              {status}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
