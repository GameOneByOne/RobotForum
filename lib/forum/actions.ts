"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { navItems } from "@/app/forum-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const allPostsLabel = "全部帖子";

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function createSlug(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || "post"}-${Date.now().toString(36)}`;
}

function createExcerpt(markdown: string): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, 120) || "暂无摘要";
}

function validatePostInput(
  title: string,
  category: string,
  content: string,
): void {
  if (!title || !content) {
    throw new Error("标题和正文不能为空。");
  }

  if (!navItems.includes(category) || category === allPostsLabel) {
    throw new Error("请选择有效的帖子分类。");
  }
}

export async function publishPost(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法发布帖子。");
  }

  const title = normalizeText(formData.get("title"));
  const category = normalizeText(formData.get("category"));
  const content = normalizeText(formData.get("content"));

  validatePostInput(title, category, content);

  const slug = createSlug(title);
  const supabase = await createClient();
  const { error } = await supabase.from("forum_posts").insert({
    slug,
    title,
    excerpt: createExcerpt(content),
    content: [content],
    author_name: "匿名用户",
    tags: [category],
    view_count: 0,
    like_count: 0,
    reply_count: 0,
    is_published: true,
  });

  if (error) {
    throw new Error(`发布失败：${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/discuss");
  redirect(`/posts/${slug}`);
}

export async function updatePost(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法更新帖子。");
  }

  const slug = normalizeText(formData.get("slug"));
  const title = normalizeText(formData.get("title"));
  const category = normalizeText(formData.get("category"));
  const content = normalizeText(formData.get("content"));

  if (!slug) {
    throw new Error("缺少帖子标识，无法更新。");
  }

  validatePostInput(title, category, content);

  const supabase = await createClient();
  const { error } = await supabase
    .from("forum_posts")
    .update({
      title,
      excerpt: createExcerpt(content),
      content: [content],
      tags: [category],
      is_published: true,
    })
    .eq("slug", slug);

  if (error) {
    throw new Error(`更新失败：${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/discuss");
  revalidatePath(`/posts/${slug}`);
  redirect(`/posts/${slug}`);
}
