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
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <section className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto w-[80vw] max-w-none px-5 py-6">
          <Link className="text-sm font-medium text-[#24706f]" href="/projects">
            返回项目列表
          </Link>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#24706f]">
                作者：{project.author}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{project.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5b6472]">
                {project.description}
              </p>
            </div>
            {canManageProject && (
              <Link
                href={`/projects/${encodeURIComponent(project.slug)}/edit`}
                className="rounded-md bg-[#24706f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
              >
                编辑项目
              </Link>
            )}
          </div>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              className="mt-4 inline-flex rounded-md border border-[#cfd6df] px-3 py-2 text-sm font-semibold text-[#3f4754] hover:bg-[#f0f3f6]"
              rel="noreferrer"
              target="_blank"
            >
              打开 GitHub
            </a>
          )}
        </div>
      </section>

      <div className="mx-auto w-[80vw] max-w-none px-5 py-6">
        <CommentSection
          comments={comments}
          targetSlug={project.slug}
          targetType="project"
        />
      </div>
    </main>
  );
}
