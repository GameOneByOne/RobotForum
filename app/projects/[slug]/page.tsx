import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentSection } from "@/components/comment-section";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getComments } from "@/lib/comments";
import { getProjectBySlug } from "@/lib/platform/queries";

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 60;

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const [project, user] = await Promise.all([
    getProjectBySlug(slug),
    getCurrentUser(),
  ]);

  if (!project) {
    notFound();
  }

  const comments = await getComments("project", project.slug);
  const canManageProject = Boolean(user && project.ownerId === user.id);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="border-b border-line bg-panel">
        <div className="mx-auto w-full max-w-7xl px-5 py-6">
          <Link className="text-sm font-medium text-accent" href="/projects">
            返回项目列表
          </Link>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-accent">
                作者：{project.author}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{project.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                {project.description}
              </p>
            </div>
            {canManageProject && (
              <Link
                href={`/projects/${encodeURIComponent(project.slug)}/edit`}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-canvas transition hover:bg-accent-strong"
              >
                编辑项目
              </Link>
            )}
          </div>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              className="mt-4 inline-flex rounded-md border border-line px-3 py-2 text-sm font-semibold text-secondary hover:bg-raised"
              rel="noreferrer"
              target="_blank"
            >
              打开 GitHub
            </a>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 py-6">
        <CommentSection
          comments={comments}
          targetSlug={project.slug}
          targetType="project"
        />
      </div>
    </main>
  );
}
