import Link from "next/link";

import { navItems } from "@/app/forum-data";
import { PostCard } from "@/components/post-card";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getForumPosts } from "@/lib/forum/posts";

type DiscussPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

const allPostsLabel = "全部帖子";

export const revalidate = 60;

export default async function DiscussPage({ searchParams }: DiscussPageProps) {
  const params = await searchParams;
  const requestedCategory = params?.category;
  const selectedCategory =
    requestedCategory && navItems.includes(requestedCategory)
      ? requestedCategory
      : allPostsLabel;
  const [filteredPosts, user] = await Promise.all([
    getForumPosts(selectedCategory),
    getCurrentUser(),
  ]);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[200px_minmax(0,1fr)_250px]">
        <aside className="rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold text-muted">讨论分类</h2>
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
                      ? "bg-accent text-canvas"
                      : "text-secondary hover:bg-raised"
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
              <p className="text-sm font-semibold text-accent">Discuss</p>
              <h1 className="mt-1 text-2xl font-bold">{selectedCategory}</h1>
            </div>
            {user ? (
              <Link
                href="/posts/new"
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-canvas transition hover:bg-accent-strong"
              >
                发布帖子
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

          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}

          {!filteredPosts.length && (
            <div className="rounded-xl border border-line bg-panel p-5 text-sm text-muted">
              还没有相关讨论，分享你的第一个工程问题吧。
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-panel p-5">
            <p className="eyebrow">COMMUNITY</p>
            <h2 className="mt-4 text-base font-semibold">一起解决工程问题</h2>
            <p className="mt-3 text-sm leading-7 text-secondary">分享背景、复现步骤和代码片段，让其他开发者更快理解你的问题。</p>
            <Link href="/knowledge" className="mt-5 inline-block text-sm text-accent">浏览工程知识库 →</Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
