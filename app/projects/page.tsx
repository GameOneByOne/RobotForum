import Link from "next/link";

import { ContentCard } from "@/components/content-card";
import { SiteHeader } from "@/components/site-header";
import { getProjects } from "@/lib/platform/queries";

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getProjects();

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
          <Link
            href="/posts/new"
            className="rounded-md bg-[#24706f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
          >
            发布帖子
          </Link>
        </div>
      </section>

      <div className="mx-auto grid w-[80vw] max-w-none gap-4 px-5 py-8 md:grid-cols-3">
        {projects.map((project) => (
          <ContentCard
            key={project.slug}
            title={project.title}
            description={`${project.description}${
              project.githubUrl ? ` GitHub: ${project.githubUrl}` : ""
            }`}
            meta={project.author}
            tags={project.tags}
          />
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
