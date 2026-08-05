import Link from "next/link";

import { navItems } from "@/app/forum-data";
import { MarkdownEditor } from "@/app/posts/new/markdown-editor";
import { SiteHeader } from "@/components/site-header";
import { publishPost } from "@/lib/forum/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const categoryItems = navItems.filter((item) => item !== "全部帖子");

export default function NewPostPage() {
  const isSupabaseConfigured = hasSupabaseEnv();

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <header className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto w-[80vw] max-w-none px-5 py-6">
          <Link
            href="/discuss"
            className="text-sm font-medium text-[#24706f] hover:text-[#1f6867]"
          >
            返回讨论列表
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#24706f]">发布帖子</p>
              <h1 className="mt-1 text-3xl font-bold">Markdown 编辑器</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#667085]">
              正文支持 CommonMark 和 GFM 语法，包括表格、任务列表、删除线、代码块和自动链接。
            </p>
          </div>
        </div>
      </header>

      <form
        action={publishPost}
        className="mx-auto w-[80vw] max-w-none space-y-5 px-5 py-6"
      >
        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-[#d8dee6] bg-white p-4 text-sm text-[#667085]">
            Supabase 环境变量未配置，发布按钮会在提交时失败；配置完成后可直接写入数据库。
          </div>
        )}

        <section className="grid gap-4 rounded-lg border border-[#d8dee6] bg-white p-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold">标题</span>
            <input
              name="title"
              className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
              placeholder="例如：机械臂舵机选型经验"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">分类</span>
            <select
              name="category"
              className="w-full rounded-md border border-[#cfd6df] bg-white px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
              required
            >
              {categoryItems.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </section>

        <MarkdownEditor name="content" />

        <div className="sticky bottom-0 flex justify-end border-t border-[#d8dee6] bg-[#f4f6f8]/95 py-4">
          <button
            type="submit"
            className="rounded-md bg-[#24706f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
          >
            发布帖子
          </button>
        </div>
      </form>
    </main>
  );
}
