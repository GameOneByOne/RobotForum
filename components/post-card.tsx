import Link from "next/link";

import type { ForumPost } from "@/app/forum-data";

type PostCardProps = {
  post: ForumPost;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block rounded-lg border border-[#d8dee6] bg-white p-5 transition hover:border-[#24706f] hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-[#24706f]">
            {post.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
        </div>
        <span className="rounded-md bg-[#eef2f6] px-2.5 py-1 text-xs font-medium text-[#526071]">
          查看
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#5b6472]">{post.excerpt}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[#f0f3f6] px-2.5 py-1 text-xs font-medium text-[#526071]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#667085]">
        <span>作者：{post.author}</span>
        <span>发布时间：{post.date}</span>
        <span>回复：{post.replies}</span>
        <span>阅读：{post.views}</span>
        <span>点赞：{post.likes}</span>
      </div>
    </Link>
  );
}
