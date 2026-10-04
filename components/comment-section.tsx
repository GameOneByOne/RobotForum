import type { CommentItem, CommentTargetType } from "@/lib/comments";
import { publishComment } from "@/lib/comments";

type CommentSectionProps = {
  comments: CommentItem[];
  targetSlug: string;
  targetType: CommentTargetType;
};

export function CommentSection({
  comments,
  targetSlug,
  targetType,
}: CommentSectionProps) {
  return (
    <section className="mt-6 rounded-xl border border-line bg-panel p-6">
      <h2 className="text-xl font-bold">评论</h2>

      <form action={publishComment} className="mt-4 space-y-3">
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetSlug" value={targetSlug} />
        <textarea
          name="content"
          required
          rows={4}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
          placeholder="写下你的想法..."
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-canvas transition hover:bg-accent-strong"
        >
          发表评论
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {comments.map((comment) => (
          <article
            key={comment.id}
            className="rounded-md border border-line bg-canvas p-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-accent">
                {comment.authorName}
              </span>
              <span>{comment.createdAt}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-secondary">
              {comment.content}
            </p>
          </article>
        ))}

        {!comments.length && (
          <p className="rounded-md border border-dashed border-line p-4 text-sm text-muted">
            暂无评论。
          </p>
        )}
      </div>
    </section>
  );
}
