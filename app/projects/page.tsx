import Link from "next/link";

import { ContentCard } from "@/components/content-card";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getProjects } from "@/lib/platform/queries";

export const revalidate = 60;

export default async function ProjectsPage() {
  const [projects, user] = await Promise.all([getProjects(), getCurrentUser()]);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <section className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto flex w-[80vw] max-w-none flex-wrap items-start justify-between gap-4 px-5 py-10">
          <div>
            <p className="text-sm font-semibold text-[#24706f]">Projects</p>
            <h1 className="mt-2 text-4xl font-bold">项目展示</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b6472]">
              展示机器人开发者正在构建的项目，数据来自 Supabase projects 表。
            </p>
          </div>
          {user ? (
            <Link
              href="/projects/new"
              className="rounded-md bg-[#24706f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
            >
              发布项目
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-[#cfd6df] px-4 py-2 text-sm font-semibold text-[#3f4754] transition hover:bg-[#f0f3f6]"
            >
              登录后发布
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto grid w-[80vw] max-w-none gap-4 px-5 py-8 md:grid-cols-3">
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
                className="inline-flex rounded-md border border-[#cfd6df] bg-white px-3 py-1.5 text-xs font-semibold text-[#3f4754] hover:bg-[#f0f3f6]"
              >
                编辑项目
              </Link>
            )}
          </div>
        ))}
      </div>

      {!projects.length && (
        <div className="mx-auto w-[80vw] max-w-none px-5 pb-8">
          <p className="rounded-lg border border-[#d8dee6] bg-white p-5 text-sm text-[#667085]">
            数据库中暂无项目数据。
          </p>
        </div>
      )}
    </main>
  );
}
