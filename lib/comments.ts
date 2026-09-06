"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { displayNameFromEmail, getCurrentUser } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

export type CommentTargetType = "post" | "project" | "knowledge" | "resource";

export type CommentItem = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

type CommentRow = {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
};

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function mapComment(row: CommentRow): CommentItem {
  return {
    id: row.id,
    authorName: row.author_name ?? "游客",
    content: row.content,
    createdAt: row.created_at.slice(0, 16).replace("T", " "),
  };
}

export async function getComments(
  targetType: CommentTargetType,
  targetSlug: string,
): Promise<CommentItem[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id,author_name,content,created_at")
    .eq("target_type", targetType)
    .eq("target_slug", targetSlug)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapComment(row as CommentRow));
}

export async function publishComment(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法评论。");
  }

  const targetType = normalizeText(formData.get("targetType"));
  const targetSlug = normalizeText(formData.get("targetSlug"));
  const content = normalizeText(formData.get("content"));
  const guestId = normalizeText(formData.get("guestId"));

  if (
    !["post", "project", "knowledge", "resource"].includes(targetType) ||
    !targetSlug ||
    !content
  ) {
    throw new Error("评论内容或目标无效。");
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    target_type: targetType,
    target_slug: targetSlug,
    author_id: user?.id ?? null,
    guest_id: user ? null : guestId || `guest-${Date.now().toString(36)}`,
    author_name: user ? displayNameFromEmail(user.email) : "游客",
    content,
  });

  if (error) {
    throw new Error(`评论失败：${error.message}`);
  }

  if (targetType === "post") {
    const path = `/posts/${encodeURIComponent(targetSlug)}`;
    revalidatePath(path);
    redirect(path);
  }

  if (targetType === "knowledge") {
    const path = `/knowledge/${encodeURIComponent(targetSlug)}`;
    revalidatePath(path);
    redirect(path);
  }

  if (targetType === "project") {
    const path = `/projects/${encodeURIComponent(targetSlug)}`;
    revalidatePath(path);
    redirect(path);
  }

  if (targetType === "resource") {
    const path = `/resources/${encodeURIComponent(targetSlug)}`;
    revalidatePath(path);
    redirect(path);
  }
}
