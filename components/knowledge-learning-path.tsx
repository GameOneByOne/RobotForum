"use client";

import { useState } from "react";
import { KnowledgeCard } from "@/components/knowledge-card";
import { useI18n } from "@/components/language-provider";
import {
  compareLearningOrder,
  isLearningMetadataTag,
} from "@/lib/knowledge/learning-path";
import type { KnowledgeItem } from "@/lib/platform-data";

export function KnowledgeLearningPath({
  items,
  siteUrl = "",
}: {
  items: KnowledgeItem[];
  siteUrl?: string;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const visibleItems = items
    .filter(
      (item) =>
        !normalized ||
        [
          item.title,
          item.summary,
          item.author,
          ...item.tags.filter((tag) => !isLearningMetadataTag(tag)),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalized),
    )
    .sort(compareLearningOrder);

  return (
    <section
      className="mx-auto w-full max-w-7xl px-5 py-8"
      aria-label={t("知识库")}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted" role="status">
          {t("显示 {0} 篇知识库", { "0": visibleItems.length })}
        </p>
        <label className="w-full sm:w-80">
          <span className="sr-only">{t("搜索知识库")}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("搜索标题、简介或标签…")}
            className="w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <KnowledgeCard key={item.slug} item={item} siteUrl={siteUrl} />
        ))}
      </div>
      {!visibleItems.length && (
        <p className="rounded-xl border border-line bg-panel p-5 text-sm text-muted">
          {t("暂无匹配的知识库。")}
        </p>
      )}
    </section>
  );
}
