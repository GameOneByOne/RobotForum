import type { ReactNode } from "react";
import { ContentCard } from "@/components/content-card";
import { PostCard } from "@/components/post-card";
import { SearchForm } from "@/components/search-form";
import { SiteHeader } from "@/components/site-header";
import { searchForumPosts } from "@/lib/forum/posts";
import { searchPlatformContent } from "@/lib/platform/queries";
import { normalizeSearchQuery, SEARCH_LIMIT } from "@/lib/search";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type SearchPageProps = { searchParams?: Promise<{ q?: string | string[] }> };

function ResultSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  if (!count) return null;
  return (
    <section>
      <h2 className="mb-5 flex items-center gap-3 text-xl font-semibold">
        {title}
        <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-xs text-muted">
          {count}
        </span>
      </h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = normalizeSearchQuery(
    typeof params?.q === "string" ? params.q : "",
  );
  const configured = hasSupabaseEnv();
  const [postsResult, platformResult] = await Promise.allSettled([
    searchForumPosts(query),
    searchPlatformContent(query),
  ]);
  const posts = postsResult.status === "fulfilled" ? postsResult.value : [];
  const results =
    platformResult.status === "fulfilled"
      ? platformResult.value
      : { knowledge: [], projects: [], resources: [] };
  const failed =
    postsResult.status === "rejected" || platformResult.status === "rejected";
  const count =
    posts.length +
    results.knowledge.length +
    results.projects.length +
    results.resources.length;
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="page-hero">
        <div className="mx-auto w-full max-w-7xl px-5 py-14">
          <p className="eyebrow">SEARCH THE PLATFORM</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">全站搜索</h1>
          <p className="mb-6 mt-4 text-sm leading-7 text-muted">
            搜索知识正文、标题、简介和标签，发现相关项目、讨论与资源。
          </p>
          <SearchForm key={query} query={query} />
        </div>
      </section>
      <div className="mx-auto w-full max-w-7xl space-y-10 px-5 py-10">
        {!query ? (
          <p className="rounded-xl border border-line bg-panel p-6 text-secondary">
            输入关键词开始搜索，例如 ROS2、Linux 或机械臂。
          </p>
        ) : (
          <>
            <p role="status" className="break-words text-sm text-muted">
              “{query}” {configured ? `· 已返回 ${count} 条结果，每类最多显示 ${SEARCH_LIMIT} 条` : ""}
            </p>
            {!configured && (
              <p
                role="status"
                className="rounded-xl border border-line bg-panel p-6 text-secondary"
              >
                尚未连接内容数据库，暂时无法搜索。
              </p>
            )}
            {failed && (
              <p
                role="alert"
                className="rounded-xl border border-danger/40 bg-danger-dim p-6 text-danger"
              >
                部分内容暂时无法搜索，请稍后重试。下方保留已成功加载的结果。
              </p>
            )}
            {configured && !failed && !count && (
              <p className="rounded-xl border border-line bg-panel p-6 text-secondary">
                没有匹配的内容，试试更短的关键词或相关标签。
              </p>
            )}
            <ResultSection title="知识库" count={results.knowledge.length}>
              {results.knowledge.map((item) => (
                <ContentCard
                  key={item.slug}
                  title={item.title}
                  description={item.summary}
                  tags={item.tags}
                  href={`/knowledge/${encodeURIComponent(item.slug)}`}
                />
              ))}
            </ResultSection>
            <ResultSection title="项目" count={results.projects.length}>
              {results.projects.map((item) => (
                <ContentCard
                  key={item.slug}
                  title={item.title}
                  description={item.description}
                  tags={item.tags}
                  meta={item.author}
                  href={`/projects/${encodeURIComponent(item.slug)}`}
                />
              ))}
            </ResultSection>
            <ResultSection title="讨论" count={posts.length}>
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </ResultSection>
            <ResultSection title="资源" count={results.resources.length}>
              {results.resources.map((item) => (
                <ContentCard
                  key={item.slug}
                  title={item.title}
                  description={item.description}
                  tags={item.tags}
                  meta={item.type}
                  href={`/resources/${encodeURIComponent(item.slug)}`}
                />
              ))}
            </ResultSection>
          </>
        )}
      </div>
    </main>
  );
}
