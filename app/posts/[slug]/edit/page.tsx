import Link from "next/link";
import { notFound } from "next/navigation";

import { navItems } from "@/app/forum-data";
import { MarkdownEditor } from "@/app/posts/new/markdown-editor";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { updatePost } from "@/lib/forum/actions";
import { getForumPostBySlug } from "@/lib/forum/posts";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type EditPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const categoryItems = navItems.filter((item) => item !== "全部帖子");

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;
  const [post, user] = await Promise.all([
    getForumPostBySlug(slug),
    getCurrentUser(),
  ]);
  const isSupabaseConfigured = hasSupabaseEnv();

  if (!post || !user || post.ownerId !== user.id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <header className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto w-[80vw] max-w-none px-5 py-6">
          <Link
            href={`/posts/${post.slug}`}
            className="text-sm font-medium text-[#24706f] hover:text-[#1f6867]"
          >
            返回帖子详情
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#24706f]">编辑帖子</p>
              <h1 className="mt-1 text-3xl font-bold">Markdown 编辑器</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#667085]">
              修改标题、分类和正文后，点击更新发布即可覆盖当前帖子内容。
            </p>
          </div>
        </div>
      </header>

      <form
        action={updatePost}
        className="mx-auto w-[80vw] max-w-none space-y-5 px-5 py-6"
      >
        <input type="hidden" name="slug" value={post.slug} />

        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-[#d8dee6] bg-white p-4 text-sm text-[#667085]">
            Supabase 环境变量未配置，更新按钮会在提交时失败；配置完成后可直接写入数据库。
          </div>
        )}

        <section className="grid gap-4 rounded-lg border border-[#d8dee6] bg-white p-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold">标题</span>
            <input
              name="title"
              defaultValue={post.title}
              className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">分类</span>
            <select
              name="category"
              defaultValue={post.category}
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

        <MarkdownEditor
          name="content"
          initialValue={post.content.join("\n\n")}
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
