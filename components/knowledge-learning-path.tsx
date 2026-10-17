"use client";

import { useI18n } from "@/components/language-provider";

import { useState } from "react";
import { ContentCard } from "@/components/content-card";
import type { KnowledgeItem } from "@/lib/platform-data";
import {
  compareLearningOrder,
  getLearningMetadata,
  isLearningMetadataTag,
  learningLevels,
  type LearningLevel,
} from "@/lib/knowledge/learning-path";

export function KnowledgeLearningPath({
  items,
  siteUrl = "",
}: {
  items: KnowledgeItem[];
  siteUrl?: string;
}) {
  const { t } = useI18n();
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel | "all">(
    "all",
  );
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const groups = learningLevels.map((level) => ({
    ...level,
    items: items
      .filter((item) => getLearningMetadata(item).level === level.value)
      .filter(
        (item) =>
          !normalized ||
          [item.title, item.summary, ...item.tags]
            .join(" ")
            .toLocaleLowerCase()
            .includes(normalized),
      )
      .sort(compareLearningOrder),
    total: items.filter(
      (item) => getLearningMetadata(item).level === level.value,
    ).length,
  }));
  const visibleGroups = groups.filter(
    (group) => selectedLevel === "all" || selectedLevel === group.value,
  );
  const resultCount = visibleGroups.reduce(
    (count, group) => count + group.items.length,
    0,
  );

  return (
    <section
      className="mx-auto w-full max-w-7xl px-5 py-10"
      aria-label={t("机器人学习路线")}
    >
      <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("学习等级筛选")}
        >
          {[
            { value: "all", label: t("全部"), total: items.length },
            ...groups,
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              aria-pressed={selectedLevel === level.value}
              onClick={() =>
                setSelectedLevel(level.value as LearningLevel | "all")
              }
              className={`rounded-full border px-5 py-2.5 text-sm transition ${selectedLevel === level.value ? "border-accent bg-accent-dim text-accent" : "border-line text-secondary hover:border-accent"}`}
            >
              {t(level.label)}{" "}
              <span className="ml-2 font-mono text-xs">{level.total}</span>
            </button>
          ))}
        </div>
        <label className="w-full sm:w-80">
          <span className="sr-only">{t("搜索学习路线中的课程")}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("搜索课程名称、简介或标签…")}
            className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </label>
      </div>
      <p className="mb-8 text-sm text-muted" role="status">
        {t("显示 {0} 篇课程 · 按学习顺序排列", { "0": resultCount })}
      </p>
      <div className="space-y-16">
        {visibleGroups.map((group) => (
          <section key={group.value} aria-labelledby={`level-${group.value}`}>
            <header className="mb-6 border-l-2 border-accent pl-5">
              <p className="eyebrow">
                {t("STAGE {0}", {
                  "0":
                    learningLevels.findIndex(
                      (level) => level.value === group.value,
                    ) + 1,
                })}
              </p>
              <h2
                id={`level-${group.value}`}
                className="mt-2 text-3xl font-semibold"
              >
                {t(group.label)}
              </h2>
              <p className="mt-3 text-sm leading-7 text-secondary">
                {t(group.description)}
              </p>
              <p className="mt-1 text-xs leading-6 text-muted">
                {t(group.outcome)}
              </p>
            </header>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => {
                const order = getLearningMetadata(item).order;
                return (
                  <ContentCard
                    key={item.slug}
                    title={item.title}
                    description={item.summary}
                    href={`${siteUrl}/knowledge/${encodeURIComponent(item.slug)}`}
                    meta={`${t(group.label)} · ${order ? t("第 {0} 课", { "0": String(order).padStart(2, "0") }) : t("拓展阅读")}`}
                    tags={item.tags.filter(
                      (tag) => !isLearningMetadataTag(tag),
                    )}
                  />
                );
              })}
            </div>
            {!group.items.length && (
              <p className="rounded-xl border border-line bg-panel p-5 text-sm text-muted">
                {normalized
                  ? t("该等级没有匹配的课程，请尝试其他关键词。")
                  : t("该等级暂无课程。")}
              </p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
