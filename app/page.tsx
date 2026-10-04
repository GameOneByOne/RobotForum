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

export const revalidate = 60;

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5 text-sm text-muted">
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
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold">{title}</h2>
      </div>
      <Link href={href} className="eyebrow">
        查看全部
      </Link>
    </div>
  );
}

export default async function Home() {
  const [projects, knowledgeItems, resources, discussions] = await Promise.all([
    getProjects(3),
    getKnowledgeItems(3),
    getResources(3),
    getForumPosts("全部帖子", 3),
  ]);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />

      <section className="page-hero">
        <div className="mx-auto w-full max-w-7xl px-5 py-12">
          <p className="eyebrow">BUILD INTELLIGENT TOGETHER</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Build Your Own Robot
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            谁不想急头白脸地做一个属于自己的机器人呢？
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-10 px-5 py-14 sm:py-20">

        <section>
          <SectionHeader eyebrow="Knowledge" title="知识库" href="/knowledge" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {knowledgeItems.map((item, index) => (
              <ContentCard
                key={item.slug}
                index={index}
                title={item.title}
                description={item.summary}
                href={`/knowledge/${encodeURIComponent(item.slug)}`}
                tags={item.tags}
              />
            ))}
          </div>
          {!knowledgeItems.length && (
            <EmptyState label="数据库中暂无知识库数据。" />
          )}
        </section>
      
        <section>
          <SectionHeader eyebrow="Projects" title="项目展示" href="/projects" />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {projects.map((project) => (
              <ContentCard
                key={project.slug}
                title={project.title}
                description={project.description}
                href={`/projects/${encodeURIComponent(project.slug)}`}
                meta={project.author}
                tags={project.tags}
              />
            ))}
          </div>
          {!projects.length && <EmptyState label="数据库中暂无项目数据。" />}
        </section>



        <section>
          <SectionHeader eyebrow="Discuss" title="最新讨论" href="/discuss" />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {discussions.map((post) => (
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
            {resources.map((resource) => (
              <ContentCard
                key={resource.slug}
                title={resource.title}
                description={resource.description}
                href={`/resources/${encodeURIComponent(resource.slug)}`}
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
