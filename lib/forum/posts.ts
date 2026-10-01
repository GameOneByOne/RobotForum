import {
  normalizeSearchQuery,
  SEARCH_LIMIT,
  textSearchFilter,
} from "@/lib/search";
import { cache } from "react";

import { navItems, type ForumPost } from "@/app/forum-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

type ForumPostRow = {
  owner_id?: string | null;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string[] | string | null;
  author_name: string | null;
  tags: string[] | null;
  view_count: number | null;
  like_count: number | null;
  reply_count: number | null;
  published_at: string | null;
};

const allPostsLabel = "全部帖子";
const deletedPostTag = "__deleted__";

function formatDate(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function normalizeContent(content: ForumPostRow["content"]): string[] {
  if (Array.isArray(content)) {
    return content;
  }

  if (typeof content === "string" && content.trim()) {
    return [content];
  }

  return [];
}

function categoryFromTags(tags: string[]): string {
  return (
    navItems.find((item) => item !== allPostsLabel && tags.includes(item)) ??
    allPostsLabel
  );
}

function mapPost(row: ForumPostRow): ForumPost {
  const tags = (row.tags ?? []).filter((tag) => tag !== deletedPostTag);

  return {
    ownerId: row.owner_id ?? null,
    slug: row.slug,
    category: categoryFromTags(tags),
    title: row.title,
    excerpt: row.excerpt ?? "",
    author: row.author_name ?? "匿名用户",
    date: formatDate(row.published_at),
    replies: row.reply_count ?? 0,
    views: row.view_count ?? 0,
    likes: row.like_count ?? 0,
    tags,
    content: normalizeContent(row.content),
  };
}

function filterBySearch(posts: ForumPost[], query: string): ForumPost[] {
  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return posts;
  }

  return posts.filter((post) => {
    const searchable = [
      post.title,
      post.excerpt,
      post.category,
      post.author,
      ...post.tags,
      ...post.content,
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(keyword);
  });
}

function searchText(values: string[], query: string): boolean {
  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return true;
  }

  return values.join(" ").toLowerCase().includes(keyword);
}

export async function getForumPosts(
  category: string,
  limit?: number,
): Promise<ForumPost[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("forum_posts")
      .select(
        "owner_id,slug,title,excerpt,author_name,tags,view_count,like_count,reply_count,published_at",
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (category !== allPostsLabel) {
      query = query.contains("tags", [category]);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data
      .filter((row) => !(row as ForumPostRow).tags?.includes(deletedPostTag))
      .map((row) => mapPost(row as ForumPostRow));
  } catch {
    return [];
  }
}

export async function searchForumPosts(query: string): Promise<ForumPost[]> {
  const keyword = normalizeSearchQuery(query);
  if (!keyword || !hasSupabaseEnv()) return [];
  const supabase = createPublicClient();
  const columns =
    "owner_id,slug,title,excerpt,author_name,tags,view_count,like_count,reply_count,published_at";
  const [textResult, tagResult] = await Promise.all([
    supabase
      .from("forum_posts")
      .select(columns)
      .eq("is_published", true)
      .not("tags", "cs", '{"__deleted__"}')
      .or(textSearchFilter(["title", "excerpt", "author_name"], keyword))
      .order("published_at", { ascending: false })
      .limit(SEARCH_LIMIT),
    supabase
      .from("forum_posts")
      .select(columns)
      .eq("is_published", true)
      .not("tags", "cs", '{"__deleted__"}')
      .contains("tags", [keyword])
      .order("published_at", { ascending: false })
      .limit(SEARCH_LIMIT),
  ]);
  if (textResult.error || tagResult.error)
    throw new Error("讨论搜索暂时不可用");
  const rows = [
    ...(textResult.data ?? []),
    ...(tagResult.data ?? []),
  ] as ForumPostRow[];
  return [...new Map(rows.map((row) => [row.slug, row])).values()]
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, SEARCH_LIMIT)
    .map(mapPost);
}

export const getForumPostBySlug = cache(async function getForumPostBySlug(
  slug: string,
): Promise<ForumPost | undefined> {
  if (!hasSupabaseEnv()) {
    return undefined;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("forum_posts")
      .select(
        "owner_id,slug,title,excerpt,content,author_name,tags,view_count,like_count,reply_count,published_at",
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) {
      return undefined;
    }

    if ((data as ForumPostRow).tags?.includes(deletedPostTag)) {
      return undefined;
    }

    return mapPost(data as ForumPostRow);
  } catch {
    return undefined;
  }
});
