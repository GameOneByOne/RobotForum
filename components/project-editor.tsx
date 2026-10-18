"use client";

import { useActionState, useId, useState } from "react";
import { MarkdownEditor } from "@/app/posts/new/markdown-editor";
import { useI18n } from "@/components/language-provider";
import { saveProject } from "@/lib/projects/actions";
import type { KnowledgeItem, ProjectCard } from "@/lib/platform-data";
import type { LessonKind, ProjectStage } from "@/lib/projects/plan";

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim";
type DraftStage = ProjectStage & { key: string };

function TextField({
  label,
  value,
  onChange,
  name,
  multiline = false,
  required = false,
  placeholder = "",
  maxLength = 500,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  const id = useId();
  const props = {
    id,
    name,
    value,
    required,
    placeholder,
    maxLength,
    className: fieldClass,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
  };
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {multiline ? <textarea {...props} rows={3} /> : <input {...props} />}
    </div>
  );
}

export function ProjectEditor({
  project,
  articles,
  canPublish,
}: {
  project?: ProjectCard;
  articles: KnowledgeItem[];
  canPublish: boolean;
}) {
  const { t } = useI18n();
  const [result, action, pending] = useActionState(saveProject, { error: "" });
  const [fields, setFields] = useState({
    title: project?.title ?? "",
    description: project?.description ?? "",
    githubUrl: project?.githubUrl ?? "",
    operatingSystem: project?.operatingSystem ?? "",
    hardware: project?.hardware.join("\n") ?? "",
    software: project?.software.join("\n") ?? "",
    prerequisites: project?.prerequisites.join("\n") ?? "",
    duration: project?.duration ?? "",
    difficulty: project?.difficulty ?? "beginner",
    tags: project?.tags.join(", ") ?? "",
  });
  const [stages, setStages] = useState<DraftStage[]>(() =>
    (project?.stages ?? []).map((stage, i) => ({
      ...stage,
      key: `stage-${i}`,
    })),
  );
  const [selected, setSelected] = useState(stages[0]?.key ?? "");
  const active = stages.find((stage) => stage.key === selected);
  function field(key: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }
  function stageField(patch: Partial<ProjectStage>) {
    setStages((current) =>
      current.map((stage) =>
        stage.key === selected ? { ...stage, ...patch } : stage,
      ),
    );
  }
  function addStage() {
    if (stages.length >= 30) return;
    const next = {
      key: crypto.randomUUID(),
      title: "",
      description: "",
      outcome: "",
      content: "",
      lessons: [],
    };
    setStages((current) => [...current, next]);
    setSelected(next.key);
  }
  function moveStage(index: number, direction: number) {
    setStages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      <input type="hidden" name="projectId" value={project?.id ?? ""} />
      <input
        type="hidden"
        name="stages"
        value={JSON.stringify(stages.map(({ key: _key, ...stage }) => stage))}
      />
      <fieldset disabled={pending} className="min-w-0 space-y-6">
        <section className="space-y-5 rounded-xl border border-line bg-panel p-5 sm:p-6">
          <h2 className="text-xl font-semibold">{t("项目概况")}</h2>
          <TextField
            name="title"
            label={t("项目名称")}
            value={fields.title}
            onChange={(v) => field("title", v)}
            required
            maxLength={160}
          />
          <TextField
            name="description"
            label={t("卡片简介")}
            value={fields.description}
            onChange={(v) => field("description", v)}
            required
            multiline
            maxLength={2000}
            placeholder={t("简要说明要做出什么，以及适合谁。")}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">{t("项目难度")}</span>
              <select
                name="difficulty"
                className={fieldClass}
                value={fields.difficulty}
                onChange={(e) => field("difficulty", e.target.value)}
              >
                <option value="beginner">{t("初级")}</option>
                <option value="intermediate">{t("中级")}</option>
                <option value="advanced">{t("高级")}</option>
              </select>
            </label>
            <TextField
              name="duration"
              label={t("预计用时")}
              value={fields.duration}
              onChange={(v) => field("duration", v)}
              maxLength={120}
              placeholder={t("例如：约 30 分钟")}
            />
          </div>
          <TextField
            name="githubUrl"
            label={t("GitHub 链接")}
            value={fields.githubUrl}
            onChange={(v) => field("githubUrl", v)}
            maxLength={2000}
            placeholder="https://github.com/..."
          />
          <TextField
            name="tags"
            label={t("标签")}
            value={fields.tags}
            onChange={(v) => field("tags", v)}
            maxLength={1500}
            placeholder={t("用逗号分隔，例如 ROS 2, 仿真")}
          />
        </section>
        <section className="space-y-5 rounded-xl border border-line bg-panel p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold">{t("前置要求")}</h2>
            <p className="mt-2 text-sm text-muted">
              {t("先说明运行环境和所需资源，让读者判断是否可以开始。")}
            </p>
          </div>
          <TextField
            name="operatingSystem"
            label={t("操作系统")}
            value={fields.operatingSystem}
            onChange={(v) => field("operatingSystem", v)}
            placeholder="Ubuntu 24.04 LTS"
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="hardware"
              label={t("硬件要求（每行一项）")}
              value={fields.hardware}
              onChange={(v) => field("hardware", v)}
              multiline
              maxLength={12000}
              placeholder={t("例如：一台电脑、键盘；无需实体机器人")}
            />
            <TextField
              name="software"
              label={t("软件要求（每行一项）")}
              value={fields.software}
              onChange={(v) => field("software", v)}
              multiline
              maxLength={12000}
              placeholder="ROS 2 Jazzy Desktop"
            />
          </div>
          <TextField
            name="prerequisites"
            label={t("已有知识（每行一项）")}
            value={fields.prerequisites}
            onChange={(v) => field("prerequisites", v)}
            multiline
            maxLength={12000}
            placeholder={t("例如：能打开终端并运行命令")}
          />
        </section>
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{t("项目说明与操作内容")}</h2>
            <p className="mt-2 text-sm text-muted">
              {t("支持 Markdown、代码、图片和公式，已有内容不会被翻译。")}
            </p>
          </div>
          <MarkdownEditor
            name="content"
            initialValue={project?.content ?? ""}
          />
        </section>
        <section className="rounded-xl border border-line bg-panel p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{t("配置学习路线")}</h2>
              <p className="mt-2 text-sm text-muted">
                {t("按实践顺序添加阶段，为每个阶段关联知识与验收目标。")}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-accent px-3 py-2 text-sm text-accent disabled:opacity-50"
              disabled={stages.length >= 30}
              onClick={addStage}
            >
              {t("添加阶段")}
            </button>
          </div>
          {!stages.length && (
            <p className="rounded-lg border border-dashed border-line p-5 text-sm text-muted">
              {t("尚未添加阶段，点击“添加阶段”开始配置。")}
            </p>
          )}
          {stages.length > 0 && (
            <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
              <ol className="space-y-2">
                {stages.map((stage, index) => (
                  <li
                    key={stage.key}
                    className={`rounded-lg border p-3 ${selected === stage.key ? "border-accent bg-accent-dim" : "border-line"}`}
                  >
                    <button
                      type="button"
                      className="w-full text-left text-sm font-medium"
                      aria-pressed={selected === stage.key}
                      onClick={() => setSelected(stage.key)}
                    >
                      {String(index + 1).padStart(2, "0")} ·{" "}
                      {stage.title || t("未命名阶段")}
                    </button>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveStage(index, -1)}
                        className="rounded border border-line px-2 py-1 disabled:opacity-30"
                        aria-label={`${t("上移阶段")} ${index + 1}`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === stages.length - 1}
                        onClick={() => moveStage(index, 1)}
                        className="rounded border border-line px-2 py-1 disabled:opacity-30"
                        aria-label={`${t("下移阶段")} ${index + 1}`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="rounded border border-line px-2 py-1 text-danger"
                        onClick={() => {
                          setStages((current) =>
                            current.filter((s) => s.key !== stage.key),
                          );
                          if (selected === stage.key)
                            setSelected(
                              stages.find((s) => s.key !== stage.key)?.key ??
                                "",
                            );
                        }}
                      >
                        {t("删除阶段")}
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
              {active && (
                <div className="min-w-0 space-y-5" key={active.key}>
                  <TextField
                    label={t("阶段名称")}
                    value={active.title}
                    onChange={(v) => stageField({ title: v })}
                    required
                    maxLength={160}
                  />
                  <TextField
                    label={t("阶段说明")}
                    value={active.description}
                    onChange={(v) => stageField({ description: v })}
                    multiline
                    maxLength={2000}
                  />
                  <TextField
                    label={t("实践成果 / 验收目标")}
                    value={active.outcome}
                    onChange={(v) => stageField({ outcome: v })}
                    required
                    multiline
                    maxLength={1000}
                    placeholder={t("例如：用键盘控制小海龟，并看到速度消息。")}
                  />
                  <TextField
                    label={t("阶段操作步骤（Markdown）")}
                    value={active.content}
                    onChange={(v) => stageField({ content: v })}
                    multiline
                    maxLength={60000}
                  />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      {t("关联知识库文章")}
                    </h3>
                    <select
                      className={fieldClass}
                      value=""
                      aria-label={t("选择要关联的文章")}
                      onChange={(event) => {
                        const knowledgeId = event.target.value;
                        if (knowledgeId)
                          stageField({
                            lessons: [
                              ...active.lessons,
                              { knowledgeId, kind: "required" },
                            ],
                          });
                      }}
                      disabled={active.lessons.length >= 30}
                    >
                      <option value="">{t("选择一篇文章添加到本阶段")}</option>
                      {articles
                        .filter(
                          (item) =>
                            !active.lessons.some(
                              (lesson) => lesson.knowledgeId === item.id,
                            ),
                        )
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                    </select>
                    {!articles.length && (
                      <p className="text-xs text-muted">
                        {t("暂无可关联的已发布文章，仍可编写阶段操作步骤。")}
                      </p>
                    )}
                    {active.lessons.map((lesson, index) => (
                      <div
                        key={lesson.knowledgeId}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-line p-3 text-sm"
                      >
                        <span className="min-w-0 flex-1 break-words">
                          {articles.find(
                            (item) => item.id === lesson.knowledgeId,
                          )?.title ||
                            lesson.title ||
                            t("文章暂不可用")}
                        </span>
                        <select
                          className="rounded border border-line bg-canvas px-2 py-1.5 text-xs"
                          aria-label={t("文章学习类型")}
                          value={lesson.kind}
                          onChange={(e) =>
                            stageField({
                              lessons: active.lessons.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      kind: e.target.value as LessonKind,
                                    }
                                  : item,
                              ),
                            })
                          }
                        >
                          <option value="required">{t("必学")}</option>
                          <option value="supplement">{t("按需补充")}</option>
                          <option value="optional">{t("拓展阅读")}</option>
                        </select>
                        <button
                          type="button"
                          className="rounded px-2 py-1 text-xs text-danger"
                          onClick={() =>
                            stageField({
                              lessons: active.lessons.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          {t("移除关联")}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </fieldset>
      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 border-t border-line bg-canvas/95 py-4 backdrop-blur">
        <p role="alert" className="text-sm text-danger">
          {result.error && t(result.error)}
        </p>
        <button
          type="submit"
          disabled={pending || !canPublish}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-canvas disabled:opacity-40"
        >
          {pending ? t("正在保存...") : project ? t("更新项目") : t("发布项目")}
        </button>
      </div>
    </form>
  );
}
