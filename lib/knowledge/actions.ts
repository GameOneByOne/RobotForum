"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type KnowledgeRecord = {
  id: string;
};

type TagRecord = {
  id: string;
  name: string;
};

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

function parseTags(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return Array.from(
      new Set(
        parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim().replace(/\s+/g, " "))
          .filter(Boolean),
      ),
    );
  } catch {
    return [];
  }
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

async function syncKnowledgeTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  knowledgeId: string,
  tags: string[],
) {
  await supabase.from("knowledge_tags").delete().eq("knowledge_id", knowledgeId);

  if (!tags.length) {
    return;
  }

  const { error: upsertError } = await supabase
    .from("tags")
    .upsert(
      tags.map((name) => ({ name })),
      { onConflict: "name", ignoreDuplicates: false },
    );

  if (upsertError) {
    throw new Error(`标签保存失败：${upsertError.message}`);
  }

  const { data: tagRows, error: selectError } = await supabase
    .from("tags")
    .select("id,name")
    .in("name", tags);

  if (selectError || !tagRows) {
    throw new Error(`标签读取失败：${selectError?.message ?? "未知错误"}`);
  }

  const relations = (tagRows as TagRecord[]).map((tag) => ({
    knowledge_id: knowledgeId,
    tag_id: tag.id,
  }));

  const { error: relationError } = await supabase
    .from("knowledge_tags")
    .insert(relations);

  if (relationError) {
    throw new Error(`标签关联失败：${relationError.message}`);
  }
}

export async function publishKnowledge(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法发布知识库内容。");
  }

  const title = normalizeText(formData.get("title"));
  const summary = normalizeText(formData.get("summary"));
  const content = normalizeText(formData.get("content"));
  const tags = parseTags(formData.get("tags"));

  validateKnowledgeInput(title, content);

  const slug = createSlug(title);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("knowledge")
    .insert({
      slug,
      title,
      summary: summary || createSummary(content),
      content,
      type: "guide",
      difficulty: "beginner",
      status: "published",
      view_count: 0,
      like_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`发布失败：${error?.message ?? "未知错误"}`);
  }

  await syncKnowledgeTags(supabase, (data as KnowledgeRecord).id, tags);

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
  const summary = normalizeText(formData.get("summary"));
  const content = normalizeText(formData.get("content"));
  const tags = parseTags(formData.get("tags"));
  const stayOnEdit = normalizeText(formData.get("stayOnEdit")) === "true";

  if (!slug) {
    throw new Error("缺少知识库标识，无法更新。");
  }

  validateKnowledgeInput(title, content);

  const nextSlug = createSlug(title);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("knowledge")
    .update({
      slug: nextSlug,
      title,
      summary: summary || createSummary(content),
      content,
      status: "published",
    })
    .eq("slug", slug)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`更新失败：${error?.message ?? "未知错误"}`);
  }

  await syncKnowledgeTags(supabase, (data as KnowledgeRecord).id, tags);

  revalidatePath("/");
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${encodeURIComponent(slug)}`);
  revalidatePath(`/knowledge/${encodeURIComponent(slug)}/edit`);
  revalidatePath(`/knowledge/${encodeURIComponent(nextSlug)}`);
  revalidatePath(`/knowledge/${encodeURIComponent(nextSlug)}/edit`);

  if (stayOnEdit) {
    redirect(`/knowledge/${encodeURIComponent(nextSlug)}/edit`);
  }

  redirect(`/knowledge/${encodeURIComponent(nextSlug)}`);
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
