import Link from "next/link";

import { ContentCard } from "@/components/content-card";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getResources } from "@/lib/platform/queries";

export const revalidate = 60;

export default async function ResourcesPage() {
  const [resources, user] = await Promise.all([
    getResources(),
    getCurrentUser(),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <section className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto flex w-[80vw] max-w-none flex-wrap items-start justify-between gap-4 px-5 py-10">
          <div>
            <p className="text-sm font-semibold text-[#24706f]">Resources</p>
            <h1 className="mt-2 text-4xl font-bold">机器人开发资源目录</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b6472]">
              开源仓库、论文、书籍、数据集、硬件、工具和课程均从 Supabase resources 表读取。
            </p>
          </div>
          {user ? (
            <Link
              href="/resources/new"
              className="rounded-md bg-[#24706f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
            >
              发布资源
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
        {resources.map((resource) => (
          <div key={resource.slug} className="space-y-2">
            <ContentCard
              title={resource.title}
              description={resource.description}
              href={`/resources/${encodeURIComponent(resource.slug)}`}
              meta={resource.type}
              tags={resource.tags}
            />
            {user && resource.creatorId === user.id && (
              <Link
                href={`/resources/${encodeURIComponent(resource.slug)}/edit`}
                className="inline-flex rounded-md border border-[#cfd6df] bg-white px-3 py-1.5 text-xs font-semibold text-[#3f4754] hover:bg-[#f0f3f6]"
              >
                编辑资源
              </Link>
            )}
          </div>
        ))}
      </div>

      {!resources.length && (
        <div className="mx-auto w-[80vw] max-w-none px-5 pb-8">
          <p className="rounded-lg border border-[#d8dee6] bg-white p-5 text-sm text-[#667085]">
            数据库中暂无资源数据。
          </p>
        </div>
      )}
    </main>
  );
}
