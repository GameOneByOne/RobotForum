"use client";

import Link from "next/link";
import { useI18n } from "@/components/language-provider";
import { iconForContent, TechIcon } from "@/components/tech-icon";
import { isLearningMetadataTag } from "@/lib/knowledge/learning-path";
import { formatKnowledgeTimestamp } from "@/lib/knowledge/presentation";
import type { KnowledgeItem } from "@/lib/platform-data";
import { getTagStyle } from "@/lib/tag-colors";

export function KnowledgeCard({
  item,
  siteUrl = "",
}: {
  item: KnowledgeItem;
  siteUrl?: string;
}) {
  const { t } = useI18n();
  const tags = item.tags.filter((tag) => !isLearningMetadataTag(tag));
  return (
    <Link
      href={`${siteUrl}/knowledge/${encodeURIComponent(item.slug)}`}
      className="tech-card knowledge-card group"
    >
      <div className="flex items-center gap-3">
        <TechIcon
          kind={iconForContent(item.title, tags)}
          className="h-10 w-10 shrink-0 text-[#9aafc3]"
        />
        <h3 className="card-title text-lg font-semibold leading-snug text-ink">
          {item.title}
        </h3>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-secondary">
        {item.summary}
      </p>
      {!!tags.length && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="tech-tag" style={getTagStyle(tag)}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="knowledge-card-meta mt-auto pt-4 text-xs leading-5 text-muted">
        <p className="mb-1 truncate" title={item.author}>
          {t("创建者")} · <span className="text-secondary">{item.author}</span>
        </p>
        <p title={t("北京时间")}>
          {t("创建时间")} ·{" "}
          <time dateTime={item.createdAt ?? undefined}>
            {formatKnowledgeTimestamp(item.createdAt)}
          </time>
        </p>
        <p title={t("北京时间")}>
          {t("最新修改时间")} ·{" "}
          <time dateTime={item.updatedAt ?? undefined}>
            {formatKnowledgeTimestamp(item.updatedAt)}
          </time>
        </p>
      </div>
    </Link>
  );
}
