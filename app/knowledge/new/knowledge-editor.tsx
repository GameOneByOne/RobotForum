"use client";

import type { ClipboardEvent, DragEvent, KeyboardEvent, MouseEvent } from "react";
import { useMemo, useRef, useState } from "react";

import { MarkdownContent } from "@/components/markdown-content";
import { getTagColorClass } from "@/lib/tag-colors";
import type { KnowledgeSection } from "@/lib/knowledge/sections";

type EditableKnowledgeSection = Omit<KnowledgeSection, "level">;

type KnowledgeEditorProps = {
  initialKnowledgeId?: string;
  initialSlug?: string;
  initialTitle?: string;
  initialSummary?: string;
  initialTags?: string[];
  initialSections?: KnowledgeSection[];
};

type ToolbarAction = {
  label: string;
  title: string;
  before: string;
  after?: string;
  placeholder?: string;
};

type ContextMenuState = {
  x: number;
  y: number;
  sectionId: string | null;
} | null;

type DropIndicatorState = {
  position: "before" | "after";
  sectionId: string;
} | null;

type CloudinaryUploadResponse = {
  error?: string;
  url?: string;
};

type SaveKnowledgeResponse = {
  error?: string;
  slug?: string;
};

const firstSectionId = "section-root";

const defaultSections: EditableKnowledgeSection[] = [
  {
    id: firstSectionId,
    parentId: null,
    title: "新章节",
    content: `请在这里编写本章节的知识库正文。

\`\`\`ts
console.log("robot knowledge");
\`\`\`
`,
  },
];

const toolbarActions: ToolbarAction[] = [
  { label: "H2", title: "二级标题", before: "\n## ", placeholder: "标题" },
  {
    label: "B",
    title: "加粗",
    before: "**",
    after: "**",
    placeholder: "加粗文本",
  },
  {
    label: "I",
    title: "斜体",
    before: "*",
    after: "*",
    placeholder: "斜体文本",
  },
  {
    label: "`",
    title: "行内代码",
    before: "`",
    after: "`",
    placeholder: "code",
  },
  {
    label: "{}",
    title: "代码块",
    before: "\n```ts\n",
    after: "\n```\n",
    placeholder: 'console.log("robot knowledge");',
  },
  { label: ">", title: "引用", before: "\n> ", placeholder: "引用内容" },
  { label: "-", title: "无序列表", before: "\n- ", placeholder: "列表项" },
  { label: "1.", title: "有序列表", before: "\n1. ", placeholder: "列表项" },
  {
    label: "[]",
    title: "任务列表",
    before: "\n- [ ] ",
    placeholder: "待办项",
  },
  {
    label: "表",
    title: "表格",
    before: "\n| 字段 | 说明 |\n| --- | --- |\n| 示例 | 内容 |\n",
  },
  {
    label: "链",
    title: "链接",
    before: "[",
    after: "](https://)",
    placeholder: "链接文本",
  },
];

function createSectionId() {
  return `section-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function childrenOf(
  sections: EditableKnowledgeSection[],
  parentId: string | null,
) {
  return sections.filter((section) => section.parentId === parentId);
}

function sectionDepth(
  sections: EditableKnowledgeSection[],
  section: EditableKnowledgeSection,
) {
  let depth = 0;
  let currentParentId = section.parentId;

  while (currentParentId) {
    const parent = sections.find((item) => item.id === currentParentId);

    if (!parent) {
      break;
    }

    depth += 1;
    currentParentId = parent.parentId;
  }

  return depth;
}

function stripDuplicateOpeningHeading(section: EditableKnowledgeSection) {
  const lines = section.content.trimStart().split(/\r?\n/);
  const firstLine = lines[0] ?? "";
  const headingMatch = /^(#{1,6})\s+(.+)$/.exec(firstLine);

  if (headingMatch?.[2].trim() !== section.title.trim()) {
    return section.content.trim();
  }

  return lines.slice(1).join("\n").trimStart().trim();
}

function flattenMarkdown(
  sections: EditableKnowledgeSection[],
  parentId: string | null = null,
): string[] {
  return childrenOf(sections, parentId).flatMap((section) => {
    const level = Math.min(sectionDepth(sections, section) + 1, 6);
    const title = section.title.trim() || "未命名章节";
    const metadata = JSON.stringify({
      id: section.id,
      parentId: section.parentId,
      title,
      level,
    });
    const content = stripDuplicateOpeningHeading({ ...section, title });

    return [
      `<!-- knowledge-section:${metadata} -->\n${content}`,
      ...flattenMarkdown(sections, section.id),
    ];
  });
}

function toEditableSections(
  sections?: KnowledgeSection[],
): EditableKnowledgeSection[] {
  if (!sections?.length) {
    return defaultSections;
  }

  return sections.map((section) => ({
    id: section.id,
    parentId: section.parentId,
    title: section.title,
    content: section.content,
  }));
}

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isImageFile(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(apng|avif|bmp|gif|heic|heif|ico|jpe?g|png|svg|tiff?|webp)$/i.test(
      file.name,
    )
  );
}

function imageFilesFromList(files: FileList | File[]) {
  return Array.from(files).filter(isImageFile);
}

function imageFilesFromDataTransfer(dataTransfer: DataTransfer) {
  const itemFiles = Array.from(dataTransfer.items)
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
  const files = itemFiles.length ? itemFiles : Array.from(dataTransfer.files);

  return imageFilesFromList(files);
}

function imageAltText(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "image";
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function isLikelyImageUrl(value: string) {
  const url = value.trim();

  return (
    isHttpUrl(url) &&
    (/\.(apng|avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(url) ||
      /\/image\/upload\//i.test(url))
  );
}

function imageMarkdownFromUrl(url: string) {
  const cleanUrl = optimizeCloudinaryImageUrl(url.trim());
  let altText = "image";

  try {
    const parsedUrl = new URL(cleanUrl);
    const fileName = decodeURIComponent(
      parsedUrl.pathname.split("/").filter(Boolean).at(-1) ?? "",
    );

    altText = imageAltText(fileName);
  } catch {
    altText = "image";
  }

  return `![${altText}|100|block](${cleanUrl})`;
}

function optimizeCloudinaryImageUrl(url: string) {
  if (!url.includes("/image/upload/") || /\/image\/upload\/[^/]*f_auto/.test(url)) {
    return url;
  }

  return url.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto,w_1600,c_limit/",
  );
}

function imageUrlFromHtml(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const source =
    document.querySelector("img")?.getAttribute("src") ??
    document.querySelector("source")?.getAttribute("srcset")?.split(/\s+/)[0];

  return source && isLikelyImageUrl(source) ? source : "";
}

function droppedImageMarkdown(dataTransfer: DataTransfer) {
  const uriList = dataTransfer
    .getData("text/uri-list")
    .split(/\r?\n/)
    .find((line) => line && !line.startsWith("#"));

  if (uriList && isLikelyImageUrl(uriList)) {
    return imageMarkdownFromUrl(uriList);
  }

  const plainText = dataTransfer.getData("text/plain");

  if (plainText && isLikelyImageUrl(plainText)) {
    return imageMarkdownFromUrl(plainText);
  }

  const htmlImageUrl = imageUrlFromHtml(dataTransfer.getData("text/html"));

  return htmlImageUrl ? imageMarkdownFromUrl(htmlImageUrl) : "";
}

function hasImageDropPayload(dataTransfer: DataTransfer) {
  if (imageFilesFromDataTransfer(dataTransfer).length) {
    return true;
  }

  return Array.from(dataTransfer.types).some((type) =>
    ["text/uri-list", "text/html"].includes(type),
  );
}

export function KnowledgeEditor({
  initialKnowledgeId = "",
  initialSlug = "",
  initialTitle = "未命名知识库",
  initialSummary = "",
  initialTags = [],
  initialSections,
}: KnowledgeEditorProps) {
  const [currentSlug, setCurrentSlug] = useState(initialSlug);
  const [knowledgeTitle, setKnowledgeTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [sections, setSections] = useState<EditableKnowledgeSection[]>(
    toEditableSections(initialSections),
  );
  const [activeSectionId, setActiveSectionId] = useState(
    initialSections?.[0]?.id ?? firstSectionId,
  );
  const [isSplitPreview, setIsSplitPreview] = useState(false);
  const [isSectionNavCollapsed, setIsSectionNavCollapsed] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorState>(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const activeSection =
    sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const combinedMarkdown = useMemo(
    () => flattenMarkdown(sections).join("\n\n"),
    [sections],
  );
  const wordCount = useMemo(
    () =>
      activeSection.content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
    [activeSection.content],
  );

  function addTag(value = tagInput) {
    const nextTag = normalizeTag(value);

    if (!nextTag || tags.includes(nextTag)) {
      setTagInput("");
      return;
    }

    setTags((current) => [...current, nextTag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((item) => item !== tag));
  }

  function updateActiveSection(patch: Partial<EditableKnowledgeSection>) {
    setSections((current) =>
      current.map((section) =>
        section.id === activeSection.id ? { ...section, ...patch } : section,
      ),
    );
  }

  function addSection(parentId: string | null) {
    const nextSection: EditableKnowledgeSection = {
      id: createSectionId(),
      parentId,
      title: "新章节",
      content: "请在这里编写章节内容。",
    };

    setSections((current) => [...current, nextSection]);
    setActiveSectionId(nextSection.id);
    setContextMenu(null);
  }

  function collectDescendantIds(sectionId: string): string[] {
    const childIds = sections
      .filter((section) => section.parentId === sectionId)
      .map((section) => section.id);

    return [
      sectionId,
      ...childIds.flatMap((childId) => collectDescendantIds(childId)),
    ];
  }

  function deleteSection(sectionId: string) {
    if (sections.length <= 1) {
      setContextMenu(null);
      return;
    }

    const idsToDelete = new Set(collectDescendantIds(sectionId));
    const nextSections = sections.filter(
      (section) => !idsToDelete.has(section.id),
    );

    if (!nextSections.length) {
      setContextMenu(null);
      return;
    }

    setSections(nextSections);
    setActiveSectionId((current) =>
      idsToDelete.has(current) ? nextSections[0].id : current,
    );
    setContextMenu(null);
  }

  function moveSection(
    draggedId: string,
    targetId: string,
    position: "before" | "after",
  ) {
    if (draggedId === targetId) {
      return;
    }

    setSections((current) => {
      const dragged = current.find((section) => section.id === draggedId);
      const target = current.find((section) => section.id === targetId);

      if (!dragged || !target || dragged.parentId !== target.parentId) {
        return current;
      }

      const nextSections = current.filter((section) => section.id !== draggedId);
      const targetIndex = nextSections.findIndex(
        (section) => section.id === targetId,
      );

      if (targetIndex < 0) {
        return current;
      }

      const insertionIndex =
        position === "after" ? targetIndex + 1 : targetIndex;

      return [
        ...nextSections.slice(0, insertionIndex),
        dragged,
        ...nextSections.slice(insertionIndex),
      ];
    });
  }

  function canDropOnSection(targetId: string) {
    if (!draggedSectionId || draggedSectionId === targetId) {
      return false;
    }

    const dragged = sections.find((section) => section.id === draggedSectionId);
    const target = sections.find((section) => section.id === targetId);

    return Boolean(dragged && target && dragged.parentId === target.parentId);
  }

  function syncPreviewScroll() {
    const textarea = textareaRef.current;
    const preview = previewRef.current;

    if (!textarea || !preview) {
      return;
    }

    const editorRange = textarea.scrollHeight - textarea.clientHeight;
    const previewRange = preview.scrollHeight - preview.clientHeight;

    if (editorRange <= 0 || previewRange <= 0) {
      preview.scrollTop = 0;
      return;
    }

    preview.scrollTop = (textarea.scrollTop / editorRange) * previewRange;
  }

  function restoreTextareaState(
    scrollTop: number,
    scrollLeft: number,
    selectionStart: number,
    selectionEnd: number,
  ) {
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;

      if (!textarea) {
        return;
      }

      textarea.focus({ preventScroll: true });
      textarea.scrollTop = scrollTop;
      textarea.scrollLeft = scrollLeft;
      textarea.setSelectionRange(selectionStart, selectionEnd);
      syncPreviewScroll();
    });
  }

  function toggleSplitPreview() {
    const textarea = textareaRef.current;

    if (!textarea) {
      setIsSplitPreview((current) => !current);
      return;
    }

    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    setIsSplitPreview((current) => !current);
    restoreTextareaState(scrollTop, scrollLeft, selectionStart, selectionEnd);
  }

  function insertMarkdown(action: ToolbarAction) {
    const textarea = textareaRef.current;
    const markdown = activeSection.content;
    const selectedText = textarea
      ? markdown.slice(textarea.selectionStart, textarea.selectionEnd)
      : "";
    const content = selectedText || action.placeholder || "";
    const after = action.after ?? "";
    const nextText = action.before + content + after;

    if (!textarea) {
      updateActiveSection({ content: markdown + nextText });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    const nextMarkdown =
      markdown.slice(0, start) + nextText + markdown.slice(end);
    const nextCursor = start + action.before.length + content.length;

    updateActiveSection({ content: nextMarkdown });
    restoreTextareaState(scrollTop, scrollLeft, nextCursor, nextCursor);
  }

  function insertTextAtRange(
    sectionId: string,
    text: string,
    selectionStart: number,
    selectionEnd: number,
    scrollTop: number,
    scrollLeft: number,
  ) {
    if (!text) {
      return;
    }

    let cursor = selectionStart + text.length;

    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        const start = Math.min(selectionStart, section.content.length);
        const end = Math.min(Math.max(selectionEnd, start), section.content.length);

        cursor = start + text.length;

        return {
          ...section,
          content: section.content.slice(0, start) + text + section.content.slice(end),
        };
      }),
    );
    restoreTextareaState(scrollTop, scrollLeft, cursor, cursor);
  }

  async function saveInPlace() {
    const textarea = textareaRef.current;
    const form = textarea?.form;

    if (!form) {
      return;
    }

    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const formData = new FormData(form);

    try {
      setSaveStatus("正在保存...");
      const response = await fetch("/api/knowledge/save", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as SaveKnowledgeResponse;

      if (!response.ok || !result.slug) {
        throw new Error(result.error || "保存失败");
      }

      setCurrentSlug(result.slug);
      window.history.replaceState(
        null,
        "",
        `/knowledge/${encodeURIComponent(result.slug)}/edit`,
      );
      restoreTextareaState(scrollTop, scrollLeft, selectionStart, selectionEnd);
      setSaveStatus("已保存");
      window.setTimeout(() => setSaveStatus(""), 1600);
    } catch (error) {
      restoreTextareaState(scrollTop, scrollLeft, selectionStart, selectionEnd);
      setSaveStatus(error instanceof Error ? error.message : "保存失败");
    }
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/image", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok || !result.url) {
      throw new Error(result.error || "图片上传失败");
    }

    return result.url;
  }

  async function uploadAndInsertImages(
    files: File[],
    selectionStart: number,
    selectionEnd: number,
    sectionId = activeSection.id,
  ) {
    const imageFiles = imageFilesFromList(files);

    if (!imageFiles.length) {
      return;
    }

    try {
      setUploadStatus(`正在上传 ${imageFiles.length} 张图片...`);
      const markdownItems = await Promise.all(
        imageFiles.map(async (file) => {
          const url = await uploadImage(file);

          return `![${imageAltText(file.name)}|100|block](${url})`;
        }),
      );
      const insertion = `\n${markdownItems.join("\n\n")}\n`;
      const textarea = textareaRef.current;
      const scrollTop = textarea?.scrollTop ?? 0;
      const scrollLeft = textarea?.scrollLeft ?? 0;

      insertTextAtRange(
        sectionId,
        insertion,
        selectionStart,
        selectionEnd,
        scrollTop,
        scrollLeft,
      );
      setUploadStatus("图片已上传");
      window.setTimeout(() => setUploadStatus(""), 1600);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "图片上传失败");
    }
  }

  function handleImagePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files = imageFilesFromDataTransfer(event.clipboardData);

    if (!files.length) {
      return;
    }

    event.preventDefault();
    void uploadAndInsertImages(
      files,
      event.currentTarget.selectionStart,
      event.currentTarget.selectionEnd,
      activeSection.id,
    );
  }

  function handleImageDrop(event: DragEvent<HTMLTextAreaElement>) {
    const files = imageFilesFromDataTransfer(event.dataTransfer);

    if (!files.length && !hasImageDropPayload(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    const textarea = event.currentTarget;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    const sectionId = activeSection.id;

    textarea.focus();

    if (files.length) {
      void uploadAndInsertImages(files, selectionStart, selectionEnd, sectionId);
      return;
    }

    const markdown = droppedImageMarkdown(event.dataTransfer);

    if (!markdown) {
      setUploadStatus("未识别到可插入的图片");
      window.setTimeout(() => setUploadStatus(""), 1600);
      return;
    }

    insertTextAtRange(
      sectionId,
      `\n${markdown}\n`,
      selectionStart,
      selectionEnd,
      scrollTop,
      scrollLeft,
    );
    setUploadStatus("图片已插入");
    window.setTimeout(() => setUploadStatus(""), 1600);
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void saveInPlace();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    toggleSplitPreview();
  }

  function handleSectionContextMenu(
    event: MouseEvent<HTMLButtonElement>,
    sectionId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      sectionId,
    });
  }

  function handleBlankContextMenu(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      sectionId: null,
    });
  }

  function renderSectionTree(parentId: string | null, depth = 0) {
    return childrenOf(sections, parentId).map((section) => {
      const isActive = section.id === activeSection.id;
      const isDropBefore =
        dropIndicator?.sectionId === section.id &&
        dropIndicator.position === "before";
      const isDropAfter =
        dropIndicator?.sectionId === section.id &&
        dropIndicator.position === "after";

      return (
        <div key={section.id}>
          {isDropBefore && (
            <div className="my-1 h-0.5 rounded-full bg-[#24706f]" />
          )}
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", section.id);
              setDraggedSectionId(section.id);
            }}
            onDragEnd={() => {
              setDraggedSectionId(null);
              setDropIndicator(null);
            }}
            onDragOver={(event) => {
              if (!canDropOnSection(section.id)) {
                setDropIndicator(null);
                return;
              }

              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              const rect = event.currentTarget.getBoundingClientRect();
              const position =
                event.clientY > rect.top + rect.height / 2 ? "after" : "before";

              setDropIndicator({
                sectionId: section.id,
                position,
              });
            }}
            onDrop={(event) => {
              event.preventDefault();
              const droppedSectionId =
                event.dataTransfer.getData("text/plain") || draggedSectionId;
              const rect = event.currentTarget.getBoundingClientRect();
              const position =
                event.clientY > rect.top + rect.height / 2 ? "after" : "before";

              if (droppedSectionId) {
                moveSection(droppedSectionId, section.id, position);
              }

              setDraggedSectionId(null);
              setDropIndicator(null);
            }}
            onClick={() => {
              setActiveSectionId(section.id);
              setContextMenu(null);
            }}
            onContextMenu={(event) =>
              handleSectionContextMenu(event, section.id)
            }
            className={`block w-full truncate rounded-md px-3 py-2 text-left text-sm font-medium ${
              isActive
                ? "bg-[#24706f] text-white"
                : "cursor-grab text-[#3f4754] hover:bg-[#f0f3f6] active:cursor-grabbing"
            }`}
            style={{ paddingLeft: `${12 + depth * 18}px` }}
          >
            {section.title || "未命名章节"}
          </button>
          {isDropAfter && (
            <div className="my-1 h-0.5 rounded-full bg-[#24706f]" />
          )}
          {renderSectionTree(section.id, depth + 1)}
        </div>
      );
    });
  }

  return (
    <div className="space-y-5">
      <input type="hidden" name="id" value={initialKnowledgeId} />
      <input type="hidden" name="slug" value={currentSlug} />
      <input type="hidden" name="content" value={combinedMarkdown} />
      <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />

      <section className="space-y-4 rounded-lg border border-[#d8dee6] bg-white p-5">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">知识库名称</span>
          <input
            name="title"
            value={knowledgeTitle}
            onChange={(event) => setKnowledgeTitle(event.target.value)}
            className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">知识库简介</span>
          <textarea
            name="summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="min-h-24 w-full resize-y rounded-md border border-[#cfd6df] px-3 py-2 text-sm leading-6 outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
            placeholder="用一两句话说明这篇知识库适合解决什么问题。"
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm font-semibold">知识库标签</span>
          <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-md border border-[#cfd6df] bg-white px-3 py-2 focus-within:border-[#24706f] focus-within:ring-2 focus-within:ring-[#b7cfcd]">
            {tags.map((tag, index) => {
              const colorClass = getTagColorClass(index);

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  title="点击删除标签"
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition brightness-100 hover:brightness-90 ${colorClass}`}
                >
                  {tag}
                </button>
              );
            })}
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addTag();
                }
              }}
              onBlur={() => addTag()}
              className="min-w-32 flex-1 border-0 bg-transparent text-sm outline-none"
              placeholder="输入标签后按 Enter"
            />
          </div>
        </div>
      </section>

      <div
        className={`grid min-h-[720px] rounded-lg border border-[#d8dee6] bg-white ${
          isSectionNavCollapsed
            ? "lg:grid-cols-[44px_1fr]"
            : "lg:grid-cols-[260px_1fr]"
        }`}
        onKeyDown={handleEditorKeyDown}
        onClick={() => setContextMenu(null)}
      >
        <aside
          className="border-b border-[#d8dee6] bg-[#fbfcfd] lg:border-b-0 lg:border-r"
          onContextMenu={handleBlankContextMenu}
        >
          {isSectionNavCollapsed ? (
            <div className="flex h-full min-h-[720px] items-start justify-center py-3">
              <button
                type="button"
                title="展开章节导航"
                aria-label="展开章节导航"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsSectionNavCollapsed(false);
                }}
                className="h-8 w-8 rounded-md border border-[#cfd6df] bg-white text-sm font-semibold text-[#3f4754] hover:border-[#24706f] hover:text-[#24706f]"
              >
                &gt;
              </button>
            </div>
          ) : (
            <>
              <div className="border-b border-[#d8dee6] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#171a20]">
                      章节导航
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#667085]">
                      右键空白处新建章节，拖拽同级章节排序。
                    </p>
                  </div>
                  <button
                    type="button"
                    title="隐藏章节导航"
                    aria-label="隐藏章节导航"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsSectionNavCollapsed(true);
                    }}
                    className="h-8 w-8 shrink-0 rounded-md border border-[#cfd6df] bg-white text-sm font-semibold text-[#3f4754] hover:border-[#24706f] hover:text-[#24706f]"
                  >
                    &lt;
                  </button>
                </div>
              </div>

              <div className="h-[640px] space-y-1 overflow-y-auto p-3">
                {renderSectionTree(null)}
              </div>
            </>
          )}
        </aside>

        <section className="min-w-0">
          <div className="border-b border-[#d8dee6] p-4">
            <label className="block max-w-xl space-y-2">
              <span className="text-sm font-semibold">当前章节名称</span>
              <input
                value={activeSection.title}
                onChange={(event) =>
                  updateActiveSection({ title: event.target.value })
                }
                className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
                required
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8dee6] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Markdown 正文</p>
              <p className="mt-1 text-xs text-[#667085]">
                每个章节拥有独立 Markdown 文档，按 Tab 切换右侧预览。
              </p>
            </div>

            <button
              type="button"
              onClick={toggleSplitPreview}
              className="rounded-md bg-[#24706f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1f6867]"
            >
              {isSplitPreview ? "关闭预览" : "分屏预览"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-[#edf0f3] bg-[#fbfcfd] px-4 py-3">
            {toolbarActions.map((action) => (
              <button
                key={action.title}
                type="button"
                title={action.title}
                onMouseDown={(event) => {
                  event.preventDefault();
                  insertMarkdown(action);
                }}
                className="min-h-8 rounded-md border border-[#cfd6df] bg-white px-2.5 text-xs font-semibold text-[#3f4754] hover:border-[#24706f] hover:text-[#24706f]"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div
            className={`grid gap-4 p-4 ${
              isSplitPreview ? "xl:grid-cols-2" : "grid-cols-1"
            }`}
          >
            <div>
              <textarea
                ref={textareaRef}
                value={activeSection.content}
                onChange={(event) => {
                  updateActiveSection({ content: event.target.value });
                  window.requestAnimationFrame(syncPreviewScroll);
                }}
                onDragOver={(event) => {
                  if (hasImageDropPayload(event.dataTransfer)) {
                    event.dataTransfer.dropEffect = "copy";
                  }

                  event.preventDefault();
                }}
                onDrop={handleImageDrop}
                onPaste={handleImagePaste}
                onScroll={syncPreviewScroll}
                className="h-[560px] w-full resize-y rounded-md border border-[#cfd6df] bg-[#fbfcfd] px-3 py-3 font-mono text-sm leading-6 outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
                required
              />
              <div className="mt-2 flex justify-between text-xs text-[#667085]">
                <span>{sections.length} 个章节</span>
                <span>
                  {saveStatus ||
                    uploadStatus ||
                    `${wordCount} words`}
                </span>
              </div>
            </div>

            {isSplitPreview && (
              <div
                ref={previewRef}
                className="h-[560px] overflow-y-auto rounded-md border border-[#edf0f3] bg-white p-4"
              >
                <div className="space-y-5 text-sm leading-7 text-[#3f4754]">
                  <MarkdownContent source={activeSection.content} />
                </div>
              </div>
            )}
          </div>
        </section>

        {contextMenu && (
          <div
            className="fixed z-50 w-44 overflow-hidden rounded-md border border-[#cfd6df] bg-white py-1 text-sm shadow-lg"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(event) => event.stopPropagation()}
          >
            {contextMenu.sectionId &&
              (() => {
                const sectionId = contextMenu.sectionId;

                return (
                  <>
                    <button
                      type="button"
                      onClick={() => addSection(sectionId)}
                      className="block w-full px-3 py-2 text-left text-[#3f4754] hover:bg-[#f0f3f6]"
                    >
                      新建子章节
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSection(sectionId)}
                      className="block w-full px-3 py-2 text-left text-[#d92d20] hover:bg-[#fff4f2]"
                    >
                      删除章节
                    </button>
                  </>
                );
              })()}
            <button
              type="button"
              onClick={() => addSection(null)}
              className="block w-full px-3 py-2 text-left text-[#3f4754] hover:bg-[#f0f3f6]"
            >
              新建章节
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
