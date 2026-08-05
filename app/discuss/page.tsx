import Link from "next/link";

import { navItems } from "@/app/forum-data";
import { PostCard } from "@/components/post-card";
import { SiteHeader } from "@/components/site-header";
import { getForumPosts } from "@/lib/forum/posts";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type DiscussPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

const allPostsLabel = "全部帖子";

export const dynamic = "force-dynamic";

export default async function DiscussPage({ searchParams }: DiscussPageProps) {
  const isSupabaseConfigured = hasSupabaseEnv();
  const params = await searchParams;
  const requestedCategory = params?.category;
  const selectedCategory =
    requestedCategory && navItems.includes(requestedCategory)
      ? requestedCategory
      : allPostsLabel;
  const filteredPosts = await getForumPosts(selectedCategory);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />

      <div className="mx-auto grid w-[80vw] max-w-none gap-5 px-5 py-6 lg:grid-cols-[20%_1fr_320px]">
        <aside className="rounded-lg border border-[#d8dee6] bg-white p-4">
          <h2 className="text-sm font-semibold text-[#667085]">讨论分类</h2>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item === selectedCategory;
              const href =
                item === allPostsLabel
                  ? "/discuss"
                  : {
                      pathname: "/discuss",
                      query: {
                        category: item,
                      },
                    };

              return (
                <Link
                  key={item}
                  href={href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-[#24706f] text-white"
                      : "text-[#3f4754] hover:bg-[#f0f3f6]"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section id="posts" className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#24706f]">Discuss</p>
              <h1 className="mt-1 text-2xl font-bold">{selectedCategory}</h1>
            </div>
            <Link
              href="/posts/new"
              className="rounded-md bg-[#24706f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
            >
              发布帖子
            </Link>
          </div>

          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}

          {!filteredPosts.length && (
            <div className="rounded-lg border border-[#d8dee6] bg-white p-5 text-sm text-[#667085]">
              当前分类暂无数据库帖子。
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-[#d8dee6] bg-white p-4">
            <h2 className="text-base font-semibold">数据读取状态</h2>
            <p className="mt-3 text-sm leading-6 text-[#5b6472]">
              当前页面只读取 Supabase forum_posts 表，不再使用前端假数据。
            </p>
          </section>

          <section className="rounded-lg border border-[#d8dee6] bg-white p-4">
            <h2 className="text-base font-semibold">部署接入状态</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#667085]">前端</dt>
                <dd className="font-medium">Vercel</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#667085]">框架</dt>
                <dd className="font-medium">Next.js</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#667085]">样式</dt>
                <dd className="font-medium">Tailwind CSS</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#667085]">后端</dt>
                <dd className="font-medium">Supabase</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#667085]">环境变量</dt>
                <dd className="font-medium">
                  {isSupabaseConfigured ? "已配置" : "待配置"}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
