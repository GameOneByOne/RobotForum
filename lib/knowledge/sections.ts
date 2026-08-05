export type KnowledgeSection = {
  id: string;
  parentId: string | null;
  title: string;
  level: number;
  content: string;
};

type SectionMetadata = {
  id?: string;
  parentId?: string | null;
  title?: string;
  level?: number;
};

function parseMarkedSections(markdown: string): KnowledgeSection[] {
  const markerPattern =
    /^<!--\s*knowledge-section:(\{.*\})\s*-->\s*$/gm;
  const matches = Array.from(markdown.matchAll(markerPattern));

  if (!matches.length) {
    return [];
  }

  return matches.map((match, index) => {
    const nextMatch = matches[index + 1];
    let metadata: SectionMetadata = {};

    try {
      metadata = JSON.parse(match[1]) as SectionMetadata;
    } catch {
      metadata = {};
    }

    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = nextMatch?.index ?? markdown.length;
    const content = markdown.slice(contentStart, contentEnd).trim();

    return {
      id: metadata.id || `section-${index + 1}`,
      parentId: metadata.parentId ?? null,
      title: metadata.title || `章节 ${index + 1}`,
      level: metadata.level || 1,
      content: content || "暂无内容",
    };
  });
}

function shouldIgnoreLegacyHeading(
  current: KnowledgeSection | undefined,
  title: string,
): boolean {
  return Boolean(
    current &&
      current.content.trim() === "" &&
      current.title.trim() === title.trim(),
  );
}

function parseLegacyHeadingSections(markdown: string): KnowledgeSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: KnowledgeSection[] = [];
  let current: KnowledgeSection | undefined;

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);

    if (headingMatch) {
      const title = headingMatch[2].trim();

      if (shouldIgnoreLegacyHeading(current, title)) {
        continue;
      }

      current = {
        id: `section-${sections.length + 1}`,
        parentId: null,
        title,
        level: headingMatch[1].length,
        content: line,
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = {
        id: "section-1",
        parentId: null,
        title: "正文",
        level: 1,
        content: "",
      };
      sections.push(current);
    }

    current.content = `${current.content}${current.content ? "\n" : ""}${line}`;
  }

  return sections;
}

export function parseKnowledgeSections(markdown: string): KnowledgeSection[] {
  const markedSections = parseMarkedSections(markdown);

  if (markedSections.length) {
    return markedSections;
  }

  const legacySections = parseLegacyHeadingSections(markdown);

  return legacySections.length
    ? legacySections
    : [
        {
          id: "section-1",
          parentId: null,
          title: "正文",
          level: 1,
          content: "暂无内容",
        },
      ];
}
