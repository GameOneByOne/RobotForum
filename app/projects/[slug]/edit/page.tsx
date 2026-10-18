import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { ProjectEditor } from "@/components/project-editor";
import { getKnowledgeItems, getProjectBySlug } from "@/lib/platform/queries";

type EditProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const t = await getTranslator();
  const { slug } = await params;
  const [project, user, articles] = await Promise.all([
    getProjectBySlug(slug),
    getCurrentUser(),
    getKnowledgeItems(),
  ]);

  if (!project || !user || project.ownerId !== user.id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="mx-auto w-full max-w-7xl px-5 py-8">
        <Link className="text-sm font-medium text-accent" href="/projects">
          {t("返回项目列表")}
        </Link>
        <div className="mt-5 space-y-6">
          <div>
            <p className="text-sm font-semibold text-accent">{t("编辑项目")}</p>
            <h1 className="mt-2 text-3xl font-bold">{project.title}</h1>
          </div>
          <ProjectEditor project={project} articles={articles} canPublish />
        </div>
      </section>
    </main>
  );
}
