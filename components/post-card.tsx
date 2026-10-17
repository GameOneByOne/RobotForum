import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";

import type { ForumPost } from "@/app/forum-data";

type PostCardProps = {
  post: ForumPost;
};

export async function PostCard({ post }: PostCardProps) {
  const t = await getTranslator();
  return (
    <Link href={`/posts/${post.slug}`} className="tech-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-accent">
            {t(post.category)}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
        </div>
        <span className="rounded-md bg-raised px-2.5 py-1 text-xs font-medium text-secondary">
          {t("查看")}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-7 text-secondary">
        {post.excerpt}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-raised px-2.5 py-1 text-xs font-medium text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted">
        <span>
          {t("作者：")}
          {post.author}
        </span>
        <span>
          {t("发布时间：")}
          {post.date}
        </span>
        <span>
          {t("回复：")}
          {post.replies}
        </span>
        <span>
          {t("阅读：")}
          {post.views}
        </span>
        <span>
          {t("点赞：")}
          {post.likes}
        </span>
      </div>
    </Link>
  );
}
