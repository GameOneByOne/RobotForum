export const lessonKinds = ["required", "supplement", "optional"] as const;
export type LessonKind = (typeof lessonKinds)[number];

export type ProjectLesson = {
  knowledgeId: string;
  kind: LessonKind;
  title?: string;
  slug?: string;
};

export type ProjectStage = {
  title: string;
  description: string;
  outcome: string;
  content: string;
  lessons: ProjectLesson[];
};

export type ProjectPlan = {
  content: string;
  operatingSystem: string;
  hardware: string[];
  software: string[];
  prerequisites: string[];
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  stages: ProjectStage[];
};

function text(value: unknown, max: number): string {
  if (value == null) return "";
  if (typeof value !== "string" || value.length > max)
    throw new Error("项目字段格式不正确或内容过长。");
  return value.trim();
}

export function projectLines(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : text(value, 12000).split(/\r?\n/);
  if (values.length > 40) throw new Error("每项前置要求最多填写 40 条。");
  return [...new Set(values.map((entry) => text(entry, 500)).filter(Boolean))];
}

export function projectTags(value: unknown): string[] {
  const raw = text(value, 1500)
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (raw.length > 20 || raw.some((tag) => tag.length > 60))
    throw new Error("项目标签最多 20 个，每个不超过 60 字。");
  return [...new Set(raw)];
}

export function parseProjectStages(value: unknown): ProjectStage[] {
  if (!Array.isArray(value) || value.length > 30)
    throw new Error("学习路线最多包含 30 个阶段。");
  return value.map((entry) => {
    if (!entry || typeof entry !== "object")
      throw new Error("学习路线格式不正确。");
    const stage = entry as Record<string, unknown>;
    const title = text(stage.title, 160),
      outcome = text(stage.outcome, 1000);
    if (!title || !outcome) throw new Error("每个阶段都需要名称和实践成果。");
    if (!Array.isArray(stage.lessons) || stage.lessons.length > 30)
      throw new Error("每个阶段最多关联 30 篇知识库文章。");
    const seen = new Set<string>();
    const lessons = stage.lessons.map((value) => {
      if (!value || typeof value !== "object")
        throw new Error("关联文章格式不正确。");
      const lesson = value as Record<string, unknown>;
      const knowledgeId = text(lesson.knowledgeId, 36);
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          knowledgeId,
        ) ||
        !lessonKinds.includes(lesson.kind as LessonKind) ||
        seen.has(knowledgeId.toLowerCase())
      ) {
        throw new Error("关联文章无效、重复或学习类型不正确。");
      }
      seen.add(knowledgeId.toLowerCase());
      return { knowledgeId, kind: lesson.kind as LessonKind };
    });
    return {
      title,
      outcome,
      description: text(stage.description, 2000),
      content: text(stage.content, 60000),
      lessons,
    };
  });
}

export function parseProjectForm(form: FormData) {
  const title = text(form.get("title"), 160),
    description = text(form.get("description"), 2000);
  if (!title || !description) throw new Error("项目名称和介绍不能为空。");
  const githubUrl = text(form.get("githubUrl"), 2000);
  if (githubUrl) {
    let url: URL;
    try {
      url = new URL(githubUrl);
    } catch {
      throw new Error("项目链接必须使用 HTTP 或 HTTPS 地址。");
    }
    if (!["http:", "https:"].includes(url.protocol))
      throw new Error("项目链接必须使用 HTTP 或 HTTPS 地址。");
  }
  let stages: unknown;
  try {
    stages = JSON.parse(text(form.get("stages"), 600000) || "[]");
  } catch {
    throw new Error("学习路线格式不正确。");
  }
  const difficulty = text(form.get("difficulty"), 20) || "beginner";
  if (!["beginner", "intermediate", "advanced"].includes(difficulty))
    throw new Error("项目难度不正确。");
  const plan: ProjectPlan = {
    content: text(form.get("content"), 150000),
    operatingSystem: text(form.get("operatingSystem"), 500),
    hardware: projectLines(form.get("hardware")),
    software: projectLines(form.get("software")),
    prerequisites: projectLines(form.get("prerequisites")),
    duration: text(form.get("duration"), 120),
    difficulty: difficulty as ProjectPlan["difficulty"],
    stages: parseProjectStages(stages),
  };
  return {
    title,
    description,
    githubUrl,
    tags: projectTags(form.get("tags")),
    ...plan,
  };
}
