import Link from "next/link";

import { ContentCard } from "@/components/content-card";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getKnowledgeItems } from "@/lib/platform/queries";

export const revalidate = 60;

export default async function KnowledgePage() {
  const [knowledgeItems, user] = await Promise.all([
    getKnowledgeItems(),
    getCurrentUser(),
  ]);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="page-hero">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-4 px-5 py-14 sm:py-20">
          <div>
            <p className="eyebrow">Knowledge</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">工程知识库</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              沉淀机器人开发中的核心知识，助力每一位创造者更进一步。
            </p>
          </div>
          {user ? (
            <Link
              href="/knowledge/new"
              className="primary-link"
            >
              发布知识库
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-raised"
            >
              登录后发布
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 md:grid-cols-2 xl:grid-cols-3">
        {knowledgeItems.map((item, index) => (
          <ContentCard
            key={item.slug}
            index={index}
            title={item.title}
            description={item.summary}
            href={`/knowledge/${encodeURIComponent(item.slug)}`}
            tags={item.tags}
          />
        ))}

        {!knowledgeItems.length && (
          <p className="rounded-xl border border-line bg-panel p-5 text-sm text-muted">
            数据库中暂无知识库数据。
          </p>
        )}
      </section>
    </main>
  );
}
