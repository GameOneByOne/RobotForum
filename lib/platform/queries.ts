import {
  includeSearchIds,
  normalizeSearchQuery,
  searchPattern,
  SEARCH_LIMIT,
  textSearchFilter,
} from "@/lib/search";
import { cache } from "react";

import type {
  KnowledgeItem,
  ProjectCard,
  ResourceItem,
} from "@/lib/platform-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

type TagRelation = {
  tags?: {
    name?: string | null;
  } | null;
};

type ProjectRow = {
  owner_id?: string | null;
  slug: string;
  title: string;
  description: string | null;
  author_name: string | null;
  github_url: string | null;
  view_count: number | null;
  like_count: number | null;
  project_tags?: TagRelation[] | null;
};

type KnowledgeRow = {
  id: string;
  author_id?: string | null;
  slug: string;
  title: string;
  summary: string | null;
  content?: string | null;
  type: string | null;
  difficulty: string | null;
  view_count: number | null;
  like_count: number | null;
  knowledge_tags?: TagRelation[] | null;
};

type ResourceRow = {
  creator_id?: string | null;
  slug: string;
  title: string;
  description: string | null;
  type: string | null;
  url: string;
  view_count: number | null;
  like_count: number | null;
  resource_tags?: TagRelation[] | null;
};

const knowledgeTypeMap = {
  tutorial: "Tutorial",
  guide: "Guide",
  best_practice: "Best Practice",
  reference: "Reference",
  faq: "FAQ",
  engineering_note: "Engineering Note",
} as const;

const difficultyMap = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

const resourceTypeMap = {
  github_repository: "Github Repository",
  paper: "Paper",
  book: "Book",
  dataset: "Dataset",
  hardware: "Hardware",
  tool: "Tool",
  course: "Course",
  reference: "Reference",
} as const;

function relationTags(relations?: TagRelation[] | null): string[] {
  return (
    relations
      ?.map((relation) => relation.tags?.name)
      .filter((name): name is string => Boolean(name)) ?? []
  );
}

function mapProject(row: ProjectRow): ProjectCard {
  return {
    ownerId: row.owner_id ?? null,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    author: row.author_name ?? "匿名用户",
    githubUrl: row.github_url ?? "",
    views: row.view_count ?? 0,
    likes: row.like_count ?? 0,
    tags: relationTags(row.project_tags),
  };
}

function mapKnowledge(row: KnowledgeRow): KnowledgeItem {
  const typeKey = row.type as keyof typeof knowledgeTypeMap;
  const difficultyKey = row.difficulty as keyof typeof difficultyMap;

  return {
    id: row.id,
    authorId: row.author_id ?? null,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    content: row.content ?? "",
    type: knowledgeTypeMap[typeKey] ?? "Guide",
    difficulty: difficultyMap[difficultyKey] ?? "Beginner",
    views: row.view_count ?? 0,
    likes: row.like_count ?? 0,
    tags: relationTags(row.knowledge_tags),
  };
}

function mapResource(row: ResourceRow): ResourceItem {
  const typeKey = row.type as keyof typeof resourceTypeMap;

  return {
    creatorId: row.creator_id ?? null,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    type: resourceTypeMap[typeKey] ?? "Tool",
    url: row.url,
    views: row.view_count ?? 0,
    likes: row.like_count ?? 0,
    tags: relationTags(row.resource_tags),
  };
}

export async function getProjects(limit?: number): Promise<ProjectCard[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("projects")
      .select(
        "owner_id,slug,title,description,author_name,github_url,view_count,like_count,project_tags(tags(name))",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((row) => mapProject(row as ProjectRow));
  } catch {
    return [];
  }
}

export const getProjectBySlug = cache(async function getProjectBySlug(
  slug: string,
): Promise<ProjectCard | undefined> {
  if (!hasSupabaseEnv()) {
    return undefined;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "owner_id,slug,title,description,author_name,github_url,view_count,like_count,project_tags(tags(name))",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return mapProject(data as ProjectRow);
});

export async function getKnowledgeItems(
  limit?: number,
): Promise<KnowledgeItem[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("knowledge")
      .select(
        "id,author_id,slug,title,summary,type,difficulty,view_count,like_count,knowledge_tags(tags(name))",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((row) => mapKnowledge(row as KnowledgeRow));
  } catch {
    return [];
  }
}

export const getKnowledgeItemBySlug = cache(
  async function getKnowledgeItemBySlug(
    slug: string,
  ): Promise<KnowledgeItem | undefined> {
    if (!hasSupabaseEnv()) {
      return undefined;
    }

    const slugCandidates = Array.from(
      new Set([
        slug,
        (() => {
          try {
            return decodeURIComponent(slug);
          } catch {
            return slug;
          }
        })(),
      ]),
    );

    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("knowledge")
        .select(
          "id,author_id,slug,title,summary,content,type,difficulty,view_count,like_count,knowledge_tags(tags(name))",
        )
        .in("slug", slugCandidates)
        .eq("status", "published")
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return undefined;
      }

      return mapKnowledge(data as KnowledgeRow);
    } catch {
      return undefined;
    }
  },
);

export async function getResources(limit?: number): Promise<ResourceItem[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("resources")
      .select(
        "creator_id,slug,title,description,type,url,view_count,like_count,resource_tags(tags(name))",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((row) => mapResource(row as ResourceRow));
  } catch {
    return [];
  }
}

export const getResourceBySlug = cache(async function getResourceBySlug(
  slug: string,
): Promise<ResourceItem | undefined> {
  if (!hasSupabaseEnv()) {
    return undefined;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("resources")
    .select(
      "creator_id,slug,title,description,type,url,view_count,like_count,resource_tags(tags(name))",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return mapResource(data as ResourceRow);
});

export async function searchPlatformContent(query: string): Promise<{
  projects: ProjectCard[];
  knowledge: KnowledgeItem[];
  resources: ResourceItem[];
}> {
  const keyword = normalizeSearchQuery(query);
  const empty = { projects: [], knowledge: [], resources: [] };
  if (!keyword || !hasSupabaseEnv()) return empty;

  const supabase = createPublicClient();
  const pattern = searchPattern(keyword);
  // Join matching tags to their parent IDs before applying the result limit.
  const tagResults = await Promise.all([
    supabase
      .from("project_tags")
      .select("project_id,tags!inner(name)")
      .ilike("tags.name", pattern)
      .limit(1000),
    supabase
      .from("knowledge_tags")
      .select("knowledge_id,tags!inner(name)")
      .ilike("tags.name", pattern)
      .limit(1000),
    supabase
      .from("resource_tags")
      .select("resource_id,tags!inner(name)")
      .ilike("tags.name", pattern)
      .limit(1000),
  ]);
  if (tagResults.some((result) => result.error))
    throw new Error("标签搜索暂时不可用");
  const [projectsResult, knowledgeResult, resourcesResult] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "owner_id,slug,title,description,author_name,github_url,view_count,like_count,project_tags(tags(name))",
      )
      .eq("is_published", true)
      .or(
        includeSearchIds(
          textSearchFilter(["title", "description", "author_name"], keyword),
          (tagResults[0].data ?? []).map((row) => row.project_id),
        ),
      )
      .order("created_at", { ascending: false })
      .limit(SEARCH_LIMIT),
    supabase
      .from("knowledge")
      .select(
        "id,author_id,slug,title,summary,type,difficulty,view_count,like_count,knowledge_tags(tags(name))",
      )
      .eq("status", "published")
      .or(
        includeSearchIds(
          textSearchFilter(["title", "summary", "content"], keyword),
          (tagResults[1].data ?? []).map((row) => row.knowledge_id),
        ),
      )
      .order("created_at", { ascending: false })
      .limit(SEARCH_LIMIT),
    supabase
      .from("resources")
      .select(
        "creator_id,slug,title,description,type,url,view_count,like_count,resource_tags(tags(name))",
      )
      .eq("is_published", true)
      .or(
        includeSearchIds(
          textSearchFilter(["title", "description", "url"], keyword),
          (tagResults[2].data ?? []).map((row) => row.resource_id),
        ),
      )
      .order("created_at", { ascending: false })
      .limit(SEARCH_LIMIT),
  ]);
  if (
    [projectsResult, knowledgeResult, resourcesResult].some(
      (result) => result.error,
    )
  ) {
    throw new Error("内容搜索暂时不可用");
  }
  return {
    projects: (projectsResult.data ?? []).map((row) =>
      mapProject(row as ProjectRow),
    ),
    knowledge: (knowledgeResult.data ?? []).map((row) =>
      mapKnowledge(row as KnowledgeRow),
    ),
    resources: (resourcesResult.data ?? []).map((row) =>
      mapResource(row as ResourceRow),
    ),
  };
}
