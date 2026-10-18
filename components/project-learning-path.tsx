"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/language-provider";
import { MarkdownContent } from "@/components/markdown-content";
import type { ProjectCard } from "@/lib/platform-data";
import type { LessonKind } from "@/lib/projects/plan";

export function ProjectLearningPath({ project }: { project: ProjectCard }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const activeIndex = Math.min(index, Math.max(project.stages.length - 1, 0));
  const stage = project.stages[activeIndex];
  const requirements = [
    {
      label: t("操作系统"),
      values: project.operatingSystem ? [project.operatingSystem] : [],
    },
    { label: t("硬件要求"), values: project.hardware },
    { label: t("软件环境"), values: project.software },
    { label: t("已有知识"), values: project.prerequisites },
  ].filter((group) => group.values.length);
  function choose(next: number) {
    setIndex(next);
    window.requestAnimationFrame(() =>
      document
        .getElementById("project-stage-content")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }
  const kindLabels: Record<LessonKind, string> = {
    required: t("必学"),
    supplement: t("按需补充"),
    optional: t("拓展阅读"),
  };
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-5 py-8">
      {requirements.length > 0 && (
        <section className="rounded-xl border border-line bg-panel p-5 sm:p-6">
          <h2 className="text-xl font-semibold">{t("开始之前")}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {requirements.map((group) => (
              <div key={group.label}>
                <h3 className="mb-2 text-sm font-semibold text-accent">
                  {group.label}
                </h3>
                <ul className="space-y-2 text-sm leading-6 text-secondary">
                  {group.values.map((value, i) => (
                    <li key={i}>{value}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
      {project.content && (
        <section className="rounded-xl border border-line bg-panel p-5 sm:p-8">
          <h2 className="mb-5 text-xl font-semibold">{t("项目说明")}</h2>
          <MarkdownContent source={project.content} />
        </section>
      )}
      {stage ? (
        <section aria-label={t("项目学习路线")}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{t("从实践走向理解")}</p>
              <h2 className="mt-2 text-2xl font-semibold">
                {t("项目学习路线")}
              </h2>
            </div>
            <p className="text-xs text-muted">
              {t("{0} 个阶段 · 按需补充理论", { 0: project.stages.length })}
            </p>
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
            <nav
              className="rounded-xl border border-line bg-panel p-3 lg:sticky lg:top-28"
              aria-label={t("学习阶段")}
            >
              <ol className="space-y-2">
                {project.stages.map((item, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      aria-current={i === activeIndex ? "step" : undefined}
                      onClick={() => choose(i)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${i === activeIndex ? "border-accent bg-accent-dim" : "border-transparent hover:bg-raised"}`}
                    >
                      <span className="project-path-dot shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted">
                          {item.outcome}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
            <article
              id="project-stage-content"
              className="min-w-0 scroll-mt-28 rounded-xl border border-line bg-panel p-5 sm:p-8"
              aria-live="polite"
            >
              <p className="text-xs text-accent">
                {t("阶段 {0} / {1}", {
                  0: activeIndex + 1,
                  1: project.stages.length,
                })}
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{stage.title}</h3>
              {stage.description && (
                <p className="mt-3 text-sm leading-7 text-secondary">
                  {stage.description}
                </p>
              )}
              <div className="my-5 rounded-lg border border-line bg-accent-dim p-4">
                <h4 className="text-sm font-semibold text-accent">
                  {t("本阶段验收目标")}
                </h4>
                <p className="mt-2 text-sm leading-7 text-secondary">
                  {stage.outcome}
                </p>
              </div>
              {(["required", "supplement", "optional"] as LessonKind[]).map(
                (kind) => {
                  const lessons = stage.lessons.filter(
                    (lesson) => lesson.kind === kind && lesson.slug,
                  );
                  return (
                    lessons.length > 0 && (
                      <section className="mb-5" key={kind}>
                        <h4 className="mb-2 text-sm font-semibold">
                          {kindLabels[kind]}
                        </h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {lessons.map((lesson) => (
                            <Link
                              key={lesson.knowledgeId}
                              href={`/knowledge/${encodeURIComponent(lesson.slug!)}`}
                              className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-3 text-sm text-secondary hover:border-accent hover:text-accent"
                            >
                              <span className="min-w-0 break-words">
                                {lesson.title}
                              </span>
                              <span className="shrink-0" aria-hidden="true">
                                ↗
                              </span>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )
                  );
                },
              )}
              {stage.content && (
                <section className="mt-6 border-t border-line pt-6">
                  <h4 className="mb-4 text-base font-semibold">
                    {t("操作步骤")}
                  </h4>
                  <MarkdownContent source={stage.content} />
                </section>
              )}
              <nav className="reading-pagination" aria-label={t("阶段切换")}>
                {activeIndex > 0 ? (
                  <button type="button" onClick={() => choose(activeIndex - 1)}>
                    {t("← 上一阶段")}
                  </button>
                ) : (
                  <span />
                )}
                {activeIndex < project.stages.length - 1 && (
                  <button type="button" onClick={() => choose(activeIndex + 1)}>
                    {t("下一阶段 →")}
                  </button>
                )}
              </nav>
            </article>
          </div>
        </section>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-5 text-sm text-muted">
          {t("作者尚未配置学习路线。")}
        </p>
      )}
    </div>
  );
}
