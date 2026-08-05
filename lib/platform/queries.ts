import type {
  KnowledgeItem,
  ProjectCard,
  ResourceItem,
} from "@/lib/platform-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type TagRelation = {
  tags?: {
    name?: string | null;
  } | null;
};

type ProjectRow = {
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
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  type: string | null;
  difficulty: string | null;
  view_count: number | null;
  like_count: number | null;
  knowledge_tags?: TagRelation[] | null;
};

type ResourceRow = {
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

function searchText(values: string[], query: string): boolean {
  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return true;
  }

  return values.join(" ").toLowerCase().includes(keyword);
}

function mapProject(row: ProjectRow): ProjectCard {
  return {
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

export async function getProjects(): Promise<ProjectCard[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "slug,title,description,author_name,github_url,view_count,like_count,project_tags(tags(name))",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => mapProject(row as ProjectRow));
  } catch {
    return [];
  }
}

export async function getKnowledgeItems(): Promise<KnowledgeItem[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("knowledge")
      .select(
        "slug,title,summary,content,type,difficulty,view_count,like_count,knowledge_tags(tags(name))",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => mapKnowledge(row as KnowledgeRow));
  } catch {
    return [];
  }
}

export async function getKnowledgeItemBySlug(
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("knowledge")
      .select(
        "slug,title,summary,content,type,difficulty,view_count,like_count,knowledge_tags(tags(name))",
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
}

export async function getResources(): Promise<ResourceItem[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select(
        "slug,title,description,type,url,view_count,like_count,resource_tags(tags(name))",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => mapResource(row as ResourceRow));
  } catch {
    return [];
  }
}

export async function searchPlatformContent(query: string): Promise<{
  projects: ProjectCard[];
  knowledge: KnowledgeItem[];
  resources: ResourceItem[];
}> {
  const [projects, knowledge, resources] = await Promise.all([
    getProjects(),
    getKnowledgeItems(),
    getResources(),
  ]);

  return {
    projects: projects.filter((project) =>
      searchText(
        [project.title, project.description, project.author, ...project.tags],
        query,
      ),
    ),
    knowledge: knowledge.filter((item) =>
      searchText(
        [item.title, item.summary, item.content, item.type, ...item.tags],
        query,
      ),
    ),
    resources: resources.filter((resource) =>
      searchText(
        [resource.title, resource.description, resource.type, resource.url, ...resource.tags],
        query,
      ),
    ),
  };
}
