import Link from "next/link";

import { ContentCard } from "@/components/content-card";
import { PostCard } from "@/components/post-card";
import { SiteHeader } from "@/components/site-header";
import { getForumPosts } from "@/lib/forum/posts";
import {
  getKnowledgeItems,
  getProjects,
  getResources,
} from "@/lib/platform/queries";

export const dynamic = "force-dynamic";

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-[#d8dee6] bg-white p-5 text-sm text-[#667085]">
      {label}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#24706f]">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold">{title}</h2>
      </div>
      <Link href={href} className="text-sm font-semibold text-[#24706f]">
        查看全部
      </Link>
    </div>
  );
}

export default async function Home() {
  const [projects, knowledgeItems, resources, discussions] = await Promise.all([
    getProjects(),
    getKnowledgeItems(),
    getResources(),
    getForumPosts("全部帖子"),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />

      <section className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto w-[80vw] max-w-none px-5 py-12">
          <p className="text-sm font-semibold uppercase text-[#24706f]">
            Robot Developer Platform
          </p>
          <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-tight">
            Build Your Own Iron Man
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5b6472]">
            一个面向机器人开发者的技术协作平台，连接工程知识、技术讨论、项目展示和资源目录。
          </p>
        </div>
      </section>

      <div className="mx-auto w-[80vw] max-w-none space-y-10 px-5 py-10">
        <section>
          <SectionHeader eyebrow="Projects" title="项目展示" href="/projects" />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <ContentCard
                key={project.slug}
                title={project.title}
                description={project.description}
                meta={project.author}
                tags={project.tags}
              />
            ))}
          </div>
          {!projects.length && <EmptyState label="数据库中暂无项目数据。" />}
        </section>

        <section>
          <SectionHeader eyebrow="Knowledge" title="知识库" href="/knowledge" />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {knowledgeItems.slice(0, 3).map((item) => (
              <ContentCard
                key={item.slug}
                title={item.title}
                description={item.summary}
                href={`/knowledge/${encodeURIComponent(item.slug)}`}
                meta={`${item.type} / ${item.difficulty}`}
                tags={item.tags}
              />
            ))}
          </div>
          {!knowledgeItems.length && (
            <EmptyState label="数据库中暂无知识库数据。" />
          )}
        </section>

        <section>
          <SectionHeader eyebrow="Discuss" title="最新讨论" href="/discuss" />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {discussions.slice(0, 3).map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          {!discussions.length && <EmptyState label="数据库中暂无讨论数据。" />}
        </section>

        <section>
          <SectionHeader
            eyebrow="Resources"
            title="资源目录"
            href="/resources"
          />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {resources.slice(0, 3).map((resource) => (
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
          {!resources.length && <EmptyState label="数据库中暂无资源数据。" />}
        </section>
      </div>
    </main>
  );
}
