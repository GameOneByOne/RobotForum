import { getTranslator } from "@/lib/i18n/server";
import { VisitorStatsPanel } from "@/components/visitor-stats-panel";

export async function SiteFooter() {
  const t = await getTranslator();
  return (
    <footer className="mx-auto w-full max-w-7xl px-5 pb-8 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-5 border-t border-line pt-6 text-xs text-muted">
        <div>
          <p className="font-mono tracking-widest">TALOVRYN</p>
          <p className="mt-2">{t("机器人开发者社区")}</p>
        </div>
        <VisitorStatsPanel />
      </div>
    </footer>
  );
}
