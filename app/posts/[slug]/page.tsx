import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentSection } from "@/components/comment-section";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getComments } from "@/lib/comments";
import { deletePost } from "@/lib/forum/actions";
import { getForumPostBySlug } from "@/lib/forum/posts";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 60;

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
  const [post, user] = await Promise.all([
    getForumPostBySlug(slug),
    getCurrentUser(),
  ]);

  if (!post) {
    notFound();
  }

  const comments = await getComments("post", post.slug);
  const canManagePost = Boolean(user && post.ownerId === user.id);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <header className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto w-[80vw] max-w-none px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/discuss"
              className="text-sm font-medium text-[#24706f] hover:text-[#1f6867]"
            >
              返回讨论列表
            </Link>
            {canManagePost && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/posts/${post.slug}/edit`}
                  className="rounded-md bg-[#24706f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
                >
                  编辑帖子
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="slug" value={post.slug} />
                  <button
                    type="submit"
                    className="rounded-md border border-[#d92d20] bg-white px-4 py-2 text-sm font-semibold text-[#d92d20] transition hover:bg-[#fff4f2]"
                  >
                    删除帖子
                  </button>
                </form>
              </div>
            )}
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

      <article className="mx-auto w-[80vw] max-w-none px-5 py-6">
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

          <div className="mt-6 space-y-6 text-xl leading-10 text-[#3f4754]">
            <MarkdownContent size="large" source={post.content.join("\n\n")} />
          </div>
        </div>

        <CommentSection
          comments={comments}
          targetSlug={post.slug}
          targetType="post"
        />
      </article>
    </main>
  );
}
