import Link from "next/link";
import { notFound } from "next/navigation";

import { KnowledgeDetailView } from "@/app/knowledge/[slug]/knowledge-detail-view";
import { SiteHeader } from "@/components/site-header";
import { deleteKnowledge } from "@/lib/knowledge/actions";
import { parseKnowledgeSections } from "@/lib/knowledge/sections";
import { getKnowledgeItemBySlug } from "@/lib/platform/queries";

type KnowledgeDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: KnowledgeDetailPageProps) {
  const { slug } = await params;
  const item = await getKnowledgeItemBySlug(slug);

  return {
    title: item ? `${item.title} | 知识库` : "知识库内容不存在",
  };
}

export default async function KnowledgeDetailPage({
  params,
}: KnowledgeDetailPageProps) {
  const { slug } = await params;
  const item = await getKnowledgeItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const sections = parseKnowledgeSections(item.content);
  const encodedSlug = encodeURIComponent(item.slug);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <header className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6">
          <Link
            href="/knowledge"
            className="text-sm font-medium text-[#24706f] hover:text-[#1f6867]"
          >
            返回知识库
          </Link>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#24706f]">
                {item.type} / {item.difficulty}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{item.title}</h1>
              {item.summary && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5b6472]">
                  {item.summary}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/knowledge/${encodedSlug}/edit`}
                className="rounded-md bg-[#24706f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
              >
                编辑知识库
              </Link>
              <form action={deleteKnowledge}>
                <input type="hidden" name="slug" value={item.slug} />
                <button
                  type="submit"
                  className="rounded-md border border-[#d92d20] bg-white px-4 py-2 text-sm font-semibold text-[#d92d20] transition hover:bg-[#fff4f2]"
                >
                  删除知识库
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <KnowledgeDetailView sections={sections} />
    </main>
  );
}
