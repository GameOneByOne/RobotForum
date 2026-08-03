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
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-sm font-semibold text-[#24706f]">Knowledge</p>
          <h1 className="mt-2 text-4xl font-bold">工程知识库</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b6472]">
            教程、指南、最佳实践、参考资料、FAQ 和工程记录均从 Supabase knowledge 表读取。
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-lg border border-[#d8dee6] bg-white p-4">
          <h2 className="text-sm font-semibold text-[#667085]">筛选</h2>
          <div className="mt-4 space-y-3 text-sm text-[#3f4754]">
            <p>Category: Tutorial / Guide / FAQ</p>
            <p>Difficulty: Beginner / Intermediate / Advanced</p>
            <p>Tag: 由数据库标签关系决定</p>
          </div>
        </aside>

        <section className="space-y-4">
          {knowledgeItems.map((item) => (
            <ContentCard
              key={item.slug}
              title={item.title}
              description={item.summary}
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
      </div>
    </main>
  );
}
