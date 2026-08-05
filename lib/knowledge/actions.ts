"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

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

  return `${base || "knowledge"}-${Date.now().toString(36)}`;
}

function createSummary(markdown: string): string {
  const text = markdown
    .replace(/^<!--\s*knowledge-section:\{.*\}\s*-->\s*$/gm, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, 160) || "暂无摘要";
}

function validateKnowledgeInput(title: string, content: string) {
  if (!title || !content) {
    throw new Error("知识库名称和正文不能为空。");
  }
}

export async function publishKnowledge(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法发布知识库内容。");
  }

  const title = normalizeText(formData.get("title"));
  const content = normalizeText(formData.get("content"));

  validateKnowledgeInput(title, content);

  const slug = createSlug(title);
  const supabase = await createClient();
  const { error } = await supabase.from("knowledge").insert({
    slug,
    title,
    summary: createSummary(content),
    content,
    type: "guide",
    difficulty: "beginner",
    status: "published",
    view_count: 0,
    like_count: 0,
  });

  if (error) {
    throw new Error(`发布失败：${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/knowledge");
  redirect("/knowledge");
}

export async function updateKnowledge(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法更新知识库内容。");
  }

  const slug = normalizeText(formData.get("slug"));
  const title = normalizeText(formData.get("title"));
  const content = normalizeText(formData.get("content"));

  if (!slug) {
    throw new Error("缺少知识库标识，无法更新。");
  }

  validateKnowledgeInput(title, content);

  const supabase = await createClient();
  const { error } = await supabase
    .from("knowledge")
    .update({
      title,
      summary: createSummary(content),
      content,
      status: "published",
    })
    .eq("slug", slug);

  if (error) {
    throw new Error(`更新失败：${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${encodeURIComponent(slug)}`);
  redirect(`/knowledge/${encodeURIComponent(slug)}`);
}

export async function deleteKnowledge(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法删除知识库内容。");
  }

  const slug = normalizeText(formData.get("slug"));

  if (!slug) {
    throw new Error("缺少知识库标识，无法删除。");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("knowledge").delete().eq("slug", slug);

  if (error) {
    throw new Error(`删除失败：${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${encodeURIComponent(slug)}`);
  redirect("/knowledge");
}
