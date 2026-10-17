import { getTranslator } from "@/lib/i18n/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { KnowledgeDetailView } from "@/app/knowledge/[slug]/knowledge-detail-view";
import sections from "./sections.json";

export default async function ReadingPreview() {
  const t = await getTranslator();
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main>
      <SiteHeader />
      <header className="mx-auto max-w-7xl px-5 pt-8 pb-2">
        <p className="eyebrow">{t("阅读样式预览")}</p>
        <h1 className="mt-4 text-3xl font-semibold">
          {t("机器人知识库 · 图文阅读")}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {t(
            "查看文字、图解、代码、表格与公式的统一排版，也可以从目录打开现有 Linux 章节。",
          )}
        </p>
      </header>
      <KnowledgeDetailView sections={sections} editHref="/knowledge" />
    </main>
  );
}
