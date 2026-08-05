import Link from "next/link";

import { ContentCard } from "@/components/content-card";
import { SiteHeader } from "@/components/site-header";
import { getResources } from "@/lib/platform/queries";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <section className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4 px-5 py-10">
          <div>
            <p className="text-sm font-semibold text-[#24706f]">Resources</p>
            <h1 className="mt-2 text-4xl font-bold">机器人开发资源目录</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b6472]">
              开源仓库、论文、书籍、数据集、硬件、工具和课程均从 Supabase resources 表读取。
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

      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 md:grid-cols-3">
        {resources.map((resource) => (
          <ContentCard
            key={resource.slug}
            title={resource.title}
            description={resource.description}
            href={resource.url}
            meta={resource.type}
            tags={resource.tags}
          />
        ))}
      </div>

      {!resources.length && (
        <div className="mx-auto max-w-7xl px-5 pb-8">
          <p className="rounded-lg border border-[#d8dee6] bg-white p-5 text-sm text-[#667085]">
            数据库中暂无资源数据。
          </p>
        </div>
      )}
    </main>
  );
}
