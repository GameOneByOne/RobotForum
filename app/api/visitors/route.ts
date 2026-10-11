import { NextResponse } from "next/server";
import { clientIp, readVisitorStats, recordVisitor } from "@/lib/analytics/visitors";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const emptyStats = { onlineVisitors: 0, visitsToday: 0, visits24h: 0 };
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const stats = hasSupabaseEnv() ? await readVisitorStats(createPublicClient(), new Date()) : emptyStats;
    return NextResponse.json(stats, { headers });
  } catch {
    return NextResponse.json({ ...emptyStats, error: "访客统计读取失败" }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) return NextResponse.json(emptyStats, { headers });
  try {
    const ip = clientIp(request.headers);
    if (!ip) return NextResponse.json({ ...emptyStats, error: "无法识别访客 IP" }, { status: 400, headers });
    const payload = await request.json().catch(() => ({}));
    const path = typeof payload?.path === "string" && payload.path.startsWith("/") ? payload.path.slice(0, 240) : "/";
    const now = new Date();
    const supabase = createPublicClient();
    // Heartbeats count the current day too, including a tab open across midnight.
    // The client cannot pick its visitor identity via JSON or browser storage.
    await recordVisitor(supabase, ip, path, now);
    return NextResponse.json(await readVisitorStats(supabase, now), { headers });
  } catch {
    return NextResponse.json({ ...emptyStats, error: "访客统计更新失败" }, { status: 500, headers });
  }
}
