import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { SupabaseClient } from "@supabase/supabase-js";

const onlineWindowMs = 5 * 60 * 1000;

export function visitorDay(now: Date) {
  // Beijing midnight, independent of the server timezone.
  return new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function clientIp(headers: Headers): string | null {
  // Vercel overwrites these headers at its trusted ingress. Self-hosted deployments
  // must configure their reverse proxy to do the same.
  const raw = (headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const version = isIP(raw);
  if (!version) return null;
  if (version === 4) return raw;
  const normalized = new URL(`http://[${raw}]/`).hostname.slice(1, -1);
  const mapped = normalized.match(/^::ffff:([0-9a-f]+):([0-9a-f]+)$/);
  if (mapped) {
    const high = parseInt(mapped[1], 16);
    const low = parseInt(mapped[2], 16);
    return [high >> 8, high & 255, low >> 8, low & 255].join(".");
  }
  return normalized;
}

export async function recordVisitor(supabase: SupabaseClient, ip: string, path: string, now: Date) {
  const ipHash = createHash("sha256").update(`robot-forum-ip-v1:${ip}`).digest("hex");
  const dailyHash = createHash("sha256").update(`robot-forum-day-v1:${visitorDay(now)}:${ip}`).digest("hex");
  // Existing PK guarantees deduplication even for concurrent requests.
  // Separate namespaces store online presence and daily unique-IP records.
  const { error } = await supabase.from("visitor_sessions").upsert([
    { visitor_id: `ip:${ipHash}`, last_seen_at: now.toISOString(), path },
    { visitor_id: `ipday:${visitorDay(now)}:${dailyHash}`, last_seen_at: now.toISOString(), path },
  ], { onConflict: "visitor_id" });
  if (error) throw new Error("访客统计写入失败");
}

export async function readVisitorStats(supabase: SupabaseClient, now: Date) {
  const [daily, online] = await Promise.all([
    supabase.from("visitor_sessions").select("visitor_id", { count: "exact", head: true })
      .like("visitor_id", `ipday:${visitorDay(now)}:%`),
    supabase.from("visitor_sessions").select("visitor_id", { count: "exact", head: true })
      .like("visitor_id", "ip:%")
      .gte("last_seen_at", new Date(now.getTime() - onlineWindowMs).toISOString()),
  ]);
  if (daily.error || online.error) throw new Error("访客统计读取失败");
  const visitsToday = daily.count ?? 0;
  return { onlineVisitors: online.count ?? 0, visitsToday,
    // Compatibility with old pages still open during deployment.
    visits24h: visitsToday, statisticsDate: visitorDay(now), timezone: "Asia/Shanghai" };
}
