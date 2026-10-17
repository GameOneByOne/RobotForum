import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { TechIcon } from "@/components/tech-icon";

export default async function NotFound() {
  const t = await getTranslator();
  return (
    <main className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <div className="mb-8 text-accent">
        <TechIcon kind="nodes" />
      </div>
      <p className="eyebrow">{t("404 · SIGNAL NOT FOUND")}</p>
      <h1 className="mt-5 text-3xl font-semibold">{t("暂时找不到这页内容")}</h1>
      <p className="mt-4 text-sm leading-7 text-secondary">
        {t("内容可能已移动、删除，或暂未开放。你可以回到知识库继续探索。")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/knowledge" className="primary-link">
          {t("浏览知识库 →")}
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-line px-5 py-3 text-sm text-secondary"
        >
          {t("返回首页")}
        </Link>
      </div>
    </main>
  );
}
