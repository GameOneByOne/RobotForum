import Link from "next/link";

import type { ForumPost } from "@/app/forum-data";

type PostCardProps = {
  post: ForumPost;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="tech-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-accent">
            {post.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
        </div>
        <span className="rounded-md bg-raised px-2.5 py-1 text-xs font-medium text-secondary">
          查看
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-7 text-secondary">{post.excerpt}</p>

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
        <span>作者：{post.author}</span>
        <span>发布时间：{post.date}</span>
        <span>回复：{post.replies}</span>
        <span>阅读：{post.views}</span>
        <span>点赞：{post.likes}</span>
      </div>
    </Link>
  );
}
