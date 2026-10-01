import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentSection } from "@/components/comment-section";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getComments } from "@/lib/comments";
import { getResourceBySlug } from "@/lib/platform/queries";

type ResourceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 60;

export default async function ResourceDetailPage({
  params,
}: ResourceDetailPageProps) {
  const { slug } = await params;
  const [resource, user] = await Promise.all([
    getResourceBySlug(slug),
    getCurrentUser(),
  ]);

  if (!resource) {
    notFound();
  }

  const comments = await getComments("resource", resource.slug);
  const canManageResource = Boolean(user && resource.creatorId === user.id);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="border-b border-line bg-panel">
        <div className="mx-auto w-full max-w-7xl px-5 py-6">
          <Link className="text-sm font-medium text-accent" href="/resources">
            返回资源目录
          </Link>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-accent">
                {resource.type}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{resource.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                {resource.description}
              </p>
            </div>
            {canManageResource && (
              <Link
                href={`/resources/${encodeURIComponent(resource.slug)}/edit`}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-canvas transition hover:bg-accent-strong"
              >
                编辑资源
              </Link>
            )}
          </div>
          <a
            href={resource.url}
            className="mt-4 inline-flex rounded-md border border-line px-3 py-2 text-sm font-semibold text-secondary hover:bg-raised"
            rel="noreferrer"
            target="_blank"
          >
            打开资源链接
          </a>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 py-6">
        <CommentSection
          comments={comments}
          targetSlug={resource.slug}
          targetType="resource"
        />
      </div>
    </main>
  );
}
