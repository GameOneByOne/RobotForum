import Link from "next/link";

import { ContentCard } from "@/components/content-card";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getProjects } from "@/lib/platform/queries";

export const revalidate = 60;

export default async function ProjectsPage() {
  const [projects, user] = await Promise.all([getProjects(), getCurrentUser()]);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="page-hero">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-4 px-5 py-14 sm:py-20">
          <div>
            <p className="eyebrow">Projects</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">项目展示</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              从工程想法到真实作品，探索机器人开发者的开源实践。
            </p>
          </div>
          {user ? (
            <Link
              href="/projects/new"
              className="primary-link"
            >
              发布项目
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
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-8 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div key={project.slug} className="space-y-2">
            <ContentCard
              title={project.title}
              description={`${project.description}${
                project.githubUrl ? ` GitHub: ${project.githubUrl}` : ""
              }`}
              href={`/projects/${encodeURIComponent(project.slug)}`}
              meta={project.author}
              tags={project.tags}
            />
            {user && project.ownerId === user.id && (
              <Link
                href={`/projects/${encodeURIComponent(project.slug)}/edit`}
                className="inline-flex rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-raised"
              >
                编辑项目
              </Link>
            )}
          </div>
        ))}
      </div>

      {!projects.length && (
        <div className="mx-auto w-full max-w-7xl px-5 pb-8">
          <p className="rounded-xl border border-line bg-panel p-5 text-sm text-muted">
            数据库中暂无项目数据。
          </p>
        </div>
      )}
    </main>
  );
}
