import Link from "next/link";
import { notFound } from "next/navigation";

import { KnowledgeDetailView } from "@/app/knowledge/[slug]/knowledge-detail-view";
import { CommentSection } from "@/components/comment-section";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getComments } from "@/lib/comments";
import { deleteKnowledge } from "@/lib/knowledge/actions";
import { parseKnowledgeSections } from "@/lib/knowledge/sections";
import { getKnowledgeItemBySlug } from "@/lib/platform/queries";

type KnowledgeDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 60;

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
  const [item, user] = await Promise.all([
    getKnowledgeItemBySlug(slug),
    getCurrentUser(),
  ]);

  if (!item) {
    notFound();
  }

  const comments = await getComments("knowledge", item.slug);
  const sections = parseKnowledgeSections(item.content);
  const encodedSlug = encodeURIComponent(item.slug);
  const canManageKnowledge = Boolean(user && item.authorId === user.id);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <header className="border-b border-line bg-panel">
        <div className="mx-auto w-full max-w-7xl px-5 py-6">
          <Link
            href="/knowledge"
            className="text-sm font-medium text-accent hover:text-accent-strong"
          >
            返回知识库
          </Link>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="mt-2 text-3xl font-bold">{item.title}</h1>
              {item.summary && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                  {item.summary}
                </p>
              )}
            </div>

            {canManageKnowledge && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/knowledge/${encodedSlug}/edit`}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-canvas transition hover:bg-accent-strong"
                >
                  编辑知识库
                </Link>
                <form action={deleteKnowledge}>
                  <input type="hidden" name="slug" value={item.slug} />
                  <button
                    type="submit"
                    className="rounded-md border border-danger bg-panel px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger-dim"
                  >
                    删除知识库
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      <KnowledgeDetailView
        editHref={`/knowledge/${encodedSlug}/edit`}
        sections={sections}
      />

      <div className="mx-auto w-full max-w-7xl px-5 pb-8">
        <CommentSection
          comments={comments}
          targetSlug={item.slug}
          targetType="knowledge"
        />
      </div>
    </main>
  );
}
