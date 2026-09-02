import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

type VisitorPayload = {
  event?: "visit" | "heartbeat";
  path?: string;
  visitorId?: string;
};

const onlineWindowMs = 5 * 60 * 1000;
const dayWindowMs = 24 * 60 * 60 * 1000;

function cleanPath(value: unknown) {
  if (typeof value !== "string") {
    return "/";
  }

  const path = value.trim();

  return path.startsWith("/") ? path.slice(0, 240) : "/";
}

function cleanVisitorId(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return /^[a-zA-Z0-9_-]{12,80}$/.test(value) ? value : "";
}

function userAgentFromRequest(request: Request) {
  return request.headers.get("user-agent")?.slice(0, 500) ?? null;
}

async function readStats() {
  if (!hasSupabaseEnv()) {
    return {
      onlineVisitors: 0,
      visits24h: 0,
    };
  }

  const supabase = createPublicClient();
  const since24h = new Date(Date.now() - dayWindowMs).toISOString();
  const onlineSince = new Date(Date.now() - onlineWindowMs).toISOString();
  const [visitsResult, onlineResult] = await Promise.all([
    supabase
      .from("visitor_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24h),
    supabase
      .from("visitor_sessions")
      .select("visitor_id", { count: "exact", head: true })
      .gte("last_seen_at", onlineSince),
  ]);

  if (visitsResult.error || onlineResult.error) {
    throw new Error(
      visitsResult.error?.message ||
        onlineResult.error?.message ||
        "访客统计读取失败",
    );
  }

  return {
    onlineVisitors: onlineResult.count ?? 0,
    visits24h: visitsResult.count ?? 0,
  };
}

export async function GET() {
  try {
    return NextResponse.json(await readStats());
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "访客统计读取失败",
        onlineVisitors: 0,
        visits24h: 0,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({
      onlineVisitors: 0,
      visits24h: 0,
    });
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as VisitorPayload;
    const visitorId = cleanVisitorId(payload.visitorId);
    const event = payload.event === "heartbeat" ? "heartbeat" : "visit";
    const path = cleanPath(payload.path);
    const userAgent = userAgentFromRequest(request);
    const supabase = createPublicClient();

    if (!visitorId) {
      return NextResponse.json(
        { error: "访客标识无效", onlineVisitors: 0, visits24h: 0 },
        { status: 400 },
      );
    }

    if (event === "visit") {
      const { error } = await supabase.from("visitor_events").insert({
        path,
        user_agent: userAgent,
        visitor_id: visitorId,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    const { error: sessionError } = await supabase
      .from("visitor_sessions")
      .upsert(
        {
          last_seen_at: new Date().toISOString(),
          path,
          user_agent: userAgent,
          visitor_id: visitorId,
        },
        { onConflict: "visitor_id" },
      );

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    return NextResponse.json(await readStats());
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "访客统计写入失败",
        onlineVisitors: 0,
        visits24h: 0,
      },
      { status: 500 },
    );
  }
}
