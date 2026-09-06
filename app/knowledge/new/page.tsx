import Link from "next/link";

import { KnowledgeEditor } from "@/app/knowledge/new/knowledge-editor";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { publishKnowledge } from "@/lib/knowledge/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function NewKnowledgePage() {
  const isSupabaseConfigured = hasSupabaseEnv();
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <header className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto w-[80vw] max-w-none px-5 py-6">
          <Link
            href="/knowledge"
            className="text-sm font-medium text-[#24706f] hover:text-[#1f6867]"
          >
            返回知识库
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#24706f]">
                发布知识库内容
              </p>
              <h1 className="mt-1 text-3xl font-bold">章节式 Markdown 编辑器</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#667085]">
              左侧维护章节结构，右侧编辑当前章节正文；每个章节都是独立 Markdown 文档。
            </p>
          </div>
        </div>
      </header>

      <form
        action={publishKnowledge}
        className="mx-auto w-[80vw] max-w-none space-y-5 px-5 py-6"
      >
        {!user && (
          <div className="rounded-lg border border-[#d8dee6] bg-white p-5 text-sm text-[#667085]">
            发布知识库需要先登录。
            <Link className="ml-2 font-semibold text-[#24706f]" href="/login">
              去登录
            </Link>
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-[#d8dee6] bg-white p-4 text-sm text-[#667085]">
            Supabase 环境变量未配置，发布按钮会在提交时失败；配置完成后可直接写入 knowledge 表。
          </div>
        )}

        <KnowledgeEditor />

        <div className="sticky bottom-0 flex justify-end border-t border-[#d8dee6] bg-[#f4f6f8]/95 py-4">
          <button
            type="submit"
            disabled={!user}
            className="rounded-md bg-[#24706f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6867] disabled:cursor-not-allowed disabled:bg-[#98a2b3]"
          >
            发布知识库
          </button>
        </div>
      </form>
    </main>
  );
}
