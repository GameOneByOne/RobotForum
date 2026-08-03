import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownContent } from "@/components/markdown-content";
import { SiteHeader } from "@/components/site-header";
import { getForumPostBySlug } from "@/lib/forum/posts";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getForumPostBySlug(slug);

  return {
    title: post ? `${post.title} | Robot Developer Platform` : "帖子不存在",
    description: post?.excerpt,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getForumPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <header className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto max-w-4xl px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/discuss"
              className="text-sm font-medium text-[#24706f] hover:text-[#1f6867]"
            >
              返回讨论列表
            </Link>
            <Link
              href={`/posts/${post.slug}/edit`}
              className="rounded-md bg-[#24706f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
            >
              编辑帖子
            </Link>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase text-[#24706f]">
            {post.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#667085]">
            <span>作者：{post.author}</span>
            <span>发布时间：{post.date}</span>
            <span>回复：{post.replies}</span>
            <span>阅读：{post.views}</span>
            <span>点赞：{post.likes}</span>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-6">
        <div className="rounded-lg border border-[#d8dee6] bg-white p-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-[#f0f3f6] px-2.5 py-1 text-xs font-medium text-[#526071]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-5 text-base leading-8 text-[#3f4754]">
            <MarkdownContent source={post.content.join("\n\n")} />
          </div>
        </div>
      </article>
    </main>
  );
}
