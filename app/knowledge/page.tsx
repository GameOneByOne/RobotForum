import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";

import { KnowledgeLearningPath } from "@/components/knowledge-learning-path";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getKnowledgeItems } from "@/lib/platform/queries";

export const revalidate = 60;

export default async function KnowledgePage() {
  const t = await getTranslator();
  const [knowledgeItems, user] = await Promise.all([
    getKnowledgeItems(),
    getCurrentUser(),
  ]);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="page-hero">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-4 px-5 py-14 sm:py-20">
          <div>
            <p className="eyebrow">{t("ROBOTICS KNOWLEDGE BASE")}</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {t("工程知识库")}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              {t("从开发环境到机器人实践，查找需要的知识与操作方法。")}
            </p>
          </div>
          {user ? (
            <Link href="/knowledge/new" className="primary-link">
              {t("发布知识库")}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-raised"
            >
              {t("登录后发布")}
            </Link>
          )}
        </div>
      </section>

      <KnowledgeLearningPath items={knowledgeItems} />
    </main>
  );
}
