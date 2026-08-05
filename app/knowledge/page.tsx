import Link from "next/link";

import { ContentCard } from "@/components/content-card";
import { SiteHeader } from "@/components/site-header";
import { getKnowledgeItems } from "@/lib/platform/queries";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const knowledgeItems = await getKnowledgeItems();

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <section className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4 px-5 py-10">
          <div>
            <p className="text-sm font-semibold text-[#24706f]">Knowledge</p>
            <h1 className="mt-2 text-4xl font-bold">工程知识库</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b6472]">
              教程、指南、最佳实践、参考资料、FAQ 和工程记录均从 Supabase knowledge 表读取。
            </p>
          </div>
          <Link
            href="/knowledge/new"
            className="rounded-md bg-[#24706f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
          >
            发布帖子
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-4 px-5 py-8">
        {knowledgeItems.map((item) => (
          <ContentCard
            key={item.slug}
            title={item.title}
            description={item.summary}
            href={`/knowledge/${encodeURIComponent(item.slug)}`}
            meta={`${item.type} / ${item.difficulty}`}
            tags={item.tags}
          />
        ))}

        {!knowledgeItems.length && (
          <p className="rounded-lg border border-[#d8dee6] bg-white p-5 text-sm text-[#667085]">
            数据库中暂无知识库数据。
          </p>
        )}
      </section>
    </main>
  );
}
