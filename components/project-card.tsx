"use client";

import Link from "next/link";
import { useI18n } from "@/components/language-provider";
import { TechIcon } from "@/components/tech-icon";
import { getTagStyle } from "@/lib/tag-colors";
import type { ProjectCard } from "@/lib/platform-data";

export function ProjectCardView({ project }: { project: ProjectCard }) {
  const { t } = useI18n();
  return (
    <Link
      href={`/projects/${encodeURIComponent(project.slug)}`}
      className="tech-card project-card"
    >
      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span>
          {t(
            project.difficulty === "advanced"
              ? "高级"
              : project.difficulty === "intermediate"
                ? "中级"
                : "初级",
          )}
        </span>
        <span>{project.duration || t("自主安排")}</span>
      </div>
      <div className="my-5 text-accent">
        <TechIcon kind="robot" className="h-14 w-14" />
      </div>
      <h2 className="text-xl font-semibold text-ink">{project.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-secondary">
        {project.description}
      </p>
      {project.operatingSystem && (
        <p className="mt-4 text-xs text-muted">
          {t("操作系统")} · {project.operatingSystem}
        </p>
      )}
      <div className="my-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="tech-tag" style={getTagStyle(tag)}>
            {tag}
          </span>
        ))}
      </div>
      {project.stages.length > 0 && (
        <ol className="project-card-path" aria-label={t("项目学习路线")}>
          {project.stages.slice(0, 3).map((stage, index) => (
            <li key={index}>
              <span className="project-path-dot">{index + 1}</span>
              <span className="min-w-0 truncate">{stage.title}</span>
            </li>
          ))}
          {project.stages.length > 3 && (
            <li className="text-muted">
              {t("另有 {0} 个阶段", { 0: project.stages.length - 3 })}
            </li>
          )}
        </ol>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-xs">
        <span className="text-muted">
          {project.stages.length
            ? t("{0} 个学习阶段", { 0: project.stages.length })
            : project.author}
        </span>
        <span className="font-semibold text-accent">
          {project.stages.length ? t("查看学习路线") : t("查看项目")} →
        </span>
      </div>
    </Link>
  );
}
