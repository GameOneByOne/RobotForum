export const learningLevels = [
  {
    value: "beginner",
    label: "初级",
    description: "建立开发环境、编程、数学与硬件基础。",
    outcome: "目标：准备好独立开发所需的基础工具与知识。",
  },
  {
    value: "intermediate",
    label: "中级",
    description: "连接 ROS 2、模型、仿真、感知与闭环控制。",
    outcome: "目标：让各个机器人模块在仿真中协同工作。",
  },
  {
    value: "advanced",
    label: "高级",
    description: "掌握运动学、规划、导航与完整系统实践。",
    outcome: "目标：完成可验证、可复现的机器人任务。",
  },
] as const;

export type LearningLevel = (typeof learningLevels)[number]["value"];

type LearningItem = { tags: string[]; difficulty?: string };

export function isLearningMetadataTag(tag: string) {
  return (
    learningLevels.some((level) => level.label === tag) ||
    isLearningOrderTag(tag)
  );
}

export function isLearningOrderTag(tag: string) {
  return /^学习顺序(?:\s*\d+)?$/.test(tag.trim());
}

export function getLearningMetadata(item: LearningItem): {
  level: LearningLevel;
  order: number | null;
} {
  // Older articles were classified through the existing tag editor before level fields existed.
  const taggedLevel = learningLevels.find((level) =>
    item.tags.includes(level.label),
  );
  const storedLevel = learningLevels.find(
    (level) => level.value === item.difficulty?.toLowerCase(),
  );
  const orderTag = item.tags.find((tag) => /^学习顺序\d+$/.test(tag));
  const order = orderTag ? Number(orderTag.replace("学习顺序", "")) : null;
  return {
    level: taggedLevel?.value ?? storedLevel?.value ?? "beginner",
    order: order && order <= 9999 ? order : null,
  };
}

export function withLearningMetadata(tags: string[], level: LearningLevel) {
  const label = learningLevels.find((entry) => entry.value === level)!.label;
  return [
    ...new Set([...tags.filter((tag) => !isLearningMetadataTag(tag)), label]),
  ];
}

export function compareLearningOrder<
  T extends LearningItem & { title: string; slug: string },
>(a: T, b: T) {
  const left = getLearningMetadata(a);
  const right = getLearningMetadata(b);
  return (
    (left.order ?? Infinity) - (right.order ?? Infinity) ||
    a.title.localeCompare(b.title, "zh-CN") ||
    a.slug.localeCompare(b.slug)
  );
}

export function parseLearningInput(formData: FormData, tags: string[]) {
  const fallback = getLearningMetadata({ tags });
  const value = formData.get("difficulty");
  const level =
    learningLevels.find((entry) => entry.value === value)?.value ??
    fallback.level;
  // Keep legacy ordering readable, but never create order tags on new saves,
  // including submissions from editor tabs opened before this update.
  return { level, tags: withLearningMetadata(tags, level) };
}
