import { ProjectCardView } from "@/components/project-card";
import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";

import { ContentCard } from "@/components/content-card";
import { KnowledgeCard } from "@/components/knowledge-card";
import { SiteHeader } from "@/components/site-header";
import { getLatestActivity } from "@/lib/activity/queries";
import { formatKnowledgeTimestamp } from "@/lib/knowledge/presentation";
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

async function ViewAllCard({
  href,
  section,
}: {
  href: string;
  section: string;
}) {
  const t = await getTranslator();
  return (
    <Link
      href={href}
      className="home-more-card group"
      aria-label={t("查看全部{0}", { "0": section })}
    >
      <span className="text-sm font-semibold">{t("查看全部")}</span>
      <span
        aria-hidden="true"
        className="text-2xl text-accent transition-transform group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

const activityLabels = {
  knowledge: {
    created: "新增了知识库文章",
    updated: "更新了知识库文章",
    commented: "评论了知识库文章",
  },
  project: {
    created: "新增了项目",
    updated: "更新了项目",
    commented: "评论了项目",
  },
  resource: {
    created: "新增了资源",
    updated: "更新了资源",
    commented: "评论了资源",
  },
  discussion: {
    created: "发布了讨论",
    updated: "更新了讨论",
    commented: "回复了讨论",
  },
} as const;

export default async function Home() {
  const t = await getTranslator();
  const [projects, knowledgeItems, resources, activity] = await Promise.all([
    getProjects(3, "updated_at"),
    getKnowledgeItems(3, "updated_at"),
    getResources(3),
    getLatestActivity(),
  ]);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="page-hero">
        <div className="mx-auto w-full max-w-7xl px-5 py-12">
          <p className="eyebrow">{t("BUILD INTELLIGENT TOGETHER")}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {t("让你的想法，拥有行动的能力")}
          </h1>
        </div>
      </section>
      <div className="mx-auto w-full max-w-7xl space-y-10 px-5 py-14 sm:py-20">
        <section>
          <h2 className="eyebrow home-section-title">{t("知识库")}</h2>
          <div className="home-preview-grid mt-4">
            {knowledgeItems.map((item) => (
              <KnowledgeCard key={item.slug} item={item} />
            ))}
            {!knowledgeItems.length && (
              <EmptyState label={t("数据库中暂无知识库数据。")} />
            )}
            <ViewAllCard href="/knowledge" section={t("知识库")} />
          </div>
        </section>
        <section>
          <h2 className="eyebrow home-section-title">{t("项目展示")}</h2>
          <div className="home-preview-grid mt-4">
            {projects.map((project) => (
              <ProjectCardView key={project.slug} project={project} />
            ))}
            {!projects.length && (
              <EmptyState label={t("数据库中暂无项目数据。")} />
            )}
            <ViewAllCard href="/projects" section={t("项目展示")} />
          </div>
        </section>
        <section>
          <h2 className="eyebrow home-section-title">{t("资源分享")}</h2>
          <div className="home-preview-grid mt-4">
            {resources.map((resource) => (
              <ContentCard
                key={resource.slug}
                title={resource.title}
                description={resource.description}
                href={`/resources/${encodeURIComponent(resource.slug)}`}
                meta={t(resource.type)}
                tags={resource.tags}
              />
            ))}
            {!resources.length && (
              <EmptyState label={t("数据库中暂无资源数据。")} />
            )}
            <ViewAllCard href="/resources" section={t("资源分享")} />
          </div>
        </section>
        <section aria-labelledby="latest-activity-heading">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="latest-activity-heading"
              className="eyebrow home-section-title"
            >
              {t("最新动态")}
            </h2>
            <p className="text-xs text-muted">{t("最近 30 条 · 北京时间")}</p>
          </div>
          {activity.length ? (
            <ol className="overflow-hidden rounded-xl border border-line bg-panel">
              {activity.slice(0, 30).map((item) => (
                <li
                  key={item.id}
                  className="home-activity-item border-b border-line px-4 py-3 last:border-b-0 sm:px-5"
                >
                  <span
                    aria-hidden="true"
                    className={`home-activity-dot${item.action === "commented" ? " home-activity-comment" : ""}`}
                  />
                  <div className="min-w-0">
                    <p className="break-words text-sm leading-6 text-secondary">
                      <span className="font-medium text-ink">{item.actor}</span>{" "}
                      {t(activityLabels[item.kind][item.action])}{" "}
                      <Link
                        href={item.href}
                        className="font-medium text-accent hover:underline"
                      >
                        {item.title}
                      </Link>
                    </p>
                    {item.excerpt && (
                      <p className="mt-0.5 line-clamp-2 break-words text-xs leading-5 text-muted">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                  <time
                    dateTime={item.occurredAt}
                    className="whitespace-nowrap text-xs leading-6 tabular-nums text-muted"
                  >
                    {formatKnowledgeTimestamp(item.occurredAt)}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              label={t("暂无动态，新的发布、修改和评论会出现在这里。")}
            />
          )}
        </section>
      </div>
    </main>
  );
}
