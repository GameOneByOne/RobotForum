import Link from "next/link";
import { notFound } from "next/navigation";

import { KnowledgeEditor } from "@/app/knowledge/new/knowledge-editor";
import { SiteHeader } from "@/components/site-header";
import { updateKnowledge } from "@/lib/knowledge/actions";
import { parseKnowledgeSections } from "@/lib/knowledge/sections";
import { getKnowledgeItemBySlug } from "@/lib/platform/queries";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type EditKnowledgePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditKnowledgePage({
  params,
}: EditKnowledgePageProps) {
  const { slug } = await params;
  const item = await getKnowledgeItemBySlug(slug);
  const isSupabaseConfigured = hasSupabaseEnv();

  if (!item) {
    notFound();
  }

  const sections = parseKnowledgeSections(item.content);
  const encodedSlug = encodeURIComponent(item.slug);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <header className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto w-[80vw] max-w-none px-5 py-6">
          <Link
            href={`/knowledge/${encodedSlug}`}
            className="text-sm font-medium text-[#24706f] hover:text-[#1f6867]"
          >
            返回知识库详情
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#24706f]">
                编辑知识库
              </p>
              <h1 className="mt-1 text-3xl font-bold">章节式 Markdown 编辑器</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#667085]">
              修改知识库名称、章节结构和正文后，点击更新发布即可覆盖当前内容。
            </p>
          </div>
        </div>
      </header>

      <form
        action={updateKnowledge}
        className="mx-auto w-[80vw] max-w-none space-y-5 px-5 py-6"
      >
        <input type="hidden" name="slug" value={item.slug} />

        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-[#d8dee6] bg-white p-4 text-sm text-[#667085]">
            Supabase 环境变量未配置，更新按钮会在提交时失败；配置完成后可直接写入 knowledge 表。
          </div>
        )}

        <KnowledgeEditor
          initialTitle={item.title}
          initialSummary={item.summary}
          initialTags={item.tags}
          initialSections={sections}
        />

        <div className="sticky bottom-0 flex justify-end border-t border-[#d8dee6] bg-[#f4f6f8]/95 py-4">
          <button
            type="submit"
            className="rounded-md bg-[#24706f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
          >
            更新发布
          </button>
        </div>
      </form>
    </main>
  );
}
