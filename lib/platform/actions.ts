"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { displayNameFromEmail, requireCurrentUser } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type TagRecord = {
  id: string;
  name: string;
};

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function createSlug(title: string, fallback: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || fallback}-${Date.now().toString(36)}`;
}

function parseTags(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(/[,，]/)
        .map((item) => item.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  );
}

async function upsertTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tags: string[],
) {
  if (!tags.length) {
    return [];
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

  const { data, error } = await supabase
    .from("tags")
    .select("id,name")
    .in("name", tags);

  if (error || !data) {
    throw new Error(`标签读取失败：${error?.message ?? "未知错误"}`);
  }

  return data as TagRecord[];
}

export async function publishProject(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法发布项目。");
  }

  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const githubUrl = normalizeText(formData.get("githubUrl"));
  const tags = parseTags(formData.get("tags"));

  if (!title || !description) {
    throw new Error("项目名称和介绍不能为空。");
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      slug: createSlug(title, "project"),
      title,
      description,
      github_url: githubUrl || null,
      author_name: displayNameFromEmail(user.email),
      is_published: true,
      view_count: 0,
      like_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`发布失败：${error?.message ?? "未知错误"}`);
  }

  const tagRows = await upsertTags(supabase, tags);

  if (tagRows.length) {
    const { error: relationError } = await supabase
      .from("project_tags")
      .upsert(
        tagRows.map((tag) => ({
          project_id: data.id,
          tag_id: tag.id,
        })),
        { ignoreDuplicates: true, onConflict: "project_id,tag_id" },
      );

    if (relationError) {
      throw new Error(`标签关联失败：${relationError.message}`);
    }
  }

  revalidatePath("/");
  revalidatePath("/projects");
  redirect("/projects");
}

export async function publishResource(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法发布资源。");
  }

  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const url = normalizeText(formData.get("url"));
  const type = normalizeText(formData.get("type")) || "tool";
  const tags = parseTags(formData.get("tags"));

  if (!title || !description || !url) {
    throw new Error("资源名称、介绍和链接不能为空。");
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .insert({
      creator_id: user.id,
      slug: createSlug(title, "resource"),
      title,
      description,
      url,
      type,
      author_name: displayNameFromEmail(user.email),
      is_published: true,
      view_count: 0,
      like_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`发布失败：${error?.message ?? "未知错误"}`);
  }

  const tagRows = await upsertTags(supabase, tags);

  if (tagRows.length) {
    const { error: relationError } = await supabase
      .from("resource_tags")
      .upsert(
        tagRows.map((tag) => ({
          resource_id: data.id,
          tag_id: tag.id,
        })),
        { ignoreDuplicates: true, onConflict: "resource_id,tag_id" },
      );

    if (relationError) {
      throw new Error(`标签关联失败：${relationError.message}`);
    }
  }

  revalidatePath("/");
  revalidatePath("/resources");
  redirect("/resources");
}

export async function updateProject(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法更新项目。");
  }

  const slug = normalizeText(formData.get("slug"));
  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const githubUrl = normalizeText(formData.get("githubUrl"));

  if (!slug || !title || !description) {
    throw new Error("项目标识、名称和介绍不能为空。");
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      title,
      description,
      github_url: githubUrl || null,
    })
    .select("slug")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`更新失败：${error?.message ?? "只能更新自己发布的项目。"}`);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateResource(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase 环境变量未配置，暂时无法更新资源。");
  }

  const slug = normalizeText(formData.get("slug"));
  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const url = normalizeText(formData.get("url"));
  const type = normalizeText(formData.get("type")) || "tool";

  if (!slug || !title || !description || !url) {
    throw new Error("资源标识、名称、介绍和链接不能为空。");
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .update({
      title,
      description,
      url,
      type,
    })
    .select("slug")
    .eq("slug", slug)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`更新失败：${error?.message ?? "只能更新自己发布的资源。"}`);
  }

  revalidatePath("/");
  revalidatePath("/resources");
  redirect("/resources");
}
