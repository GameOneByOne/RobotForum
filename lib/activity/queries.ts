import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export type ActivityItem = {
  id: string;
  actor: string;
  action: "created" | "updated" | "commented";
  kind: "knowledge" | "project" | "resource" | "discussion";
  title: string;
  href: string;
  occurredAt: string;
  excerpt?: string;
};

type ActivityRow = {
  id: string;
  actor_name: string | null;
  action: ActivityItem["action"];
  kind: ActivityItem["kind"];
  title: string;
  slug: string;
  occurred_at: string;
  comment_excerpt: string | null;
};

const paths = {
  knowledge: "knowledge",
  project: "projects",
  resource: "resources",
  discussion: "posts",
} as const;

/** The database checks current publication/comment visibility before the limit. */
export async function getLatestActivity(): Promise<ActivityItem[]> {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await createPublicClient().rpc("get_latest_activity", {
    p_limit: 30,
  });
  if (error) throw new Error(`Activity query failed: ${error.message}`);
  return ((data ?? []) as ActivityRow[]).map((row) => ({
    id: row.id,
    actor: row.actor_name?.trim() || "游客",
    action: row.action,
    kind: row.kind,
    title: row.title,
    href: `/${paths[row.kind]}/${encodeURIComponent(row.slug)}`,
    occurredAt: row.occurred_at,
    ...(row.comment_excerpt ? { excerpt: row.comment_excerpt } : {}),
  }));
}
