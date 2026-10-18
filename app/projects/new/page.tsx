import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { ProjectEditor } from "@/components/project-editor";
import { getKnowledgeItems } from "@/lib/platform/queries";

export default async function NewProjectPage() {
  const t = await getTranslator();
  const [user, articles] = await Promise.all([
    getCurrentUser(),
    getKnowledgeItems(),
  ]);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="mx-auto w-full max-w-7xl px-5 py-8">
        <Link className="text-sm font-medium text-accent" href="/projects">
          {t("返回项目列表")}
        </Link>
        <div className="mt-5 space-y-6">
          <div>
            <p className="text-sm font-semibold text-accent">{t("发布项目")}</p>
            <h1 className="mt-2 text-3xl font-bold">
              {t("分享你的机器人项目")}
            </h1>
          </div>
          {!user && (
            <p className="rounded-lg border border-line bg-panel p-4 text-sm text-muted">
              {t("发布项目需要先登录。")}{" "}
              <Link href="/login" className="text-accent">
                {t("去登录")}
              </Link>
            </p>
          )}
          <ProjectEditor articles={articles} canPublish={Boolean(user)} />
        </div>
      </section>
    </main>
  );
}
