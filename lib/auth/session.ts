import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string | null;
  level?: number | null;
  points?: number | null;
};

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
}

function metadataText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function avatarUrl(value: unknown): string | null {
  const text = metadataText(value);
  if (!text) return null;

  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "已登录用户",
    displayName:
      metadataText(user.user_metadata?.display_name) ??
      metadataText(user.user_metadata?.full_name) ??
      displayNameFromEmail(user.email ?? ""),
    avatarUrl: avatarUrl(user.user_metadata?.avatar_url),
    // Account stats must come from server-managed metadata, not editable user metadata.
    level: nonNegativeInteger(user.app_metadata?.level),
    points: nonNegativeInteger(user.app_metadata?.points),
  };
}

export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("请先登录后再进行此操作。");
  }

  return user;
}

export function displayNameFromEmail(email: string): string {
  return email.split("@")[0] || "注册用户";
}
