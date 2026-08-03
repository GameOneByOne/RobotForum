"use client";

import type { KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";

import { MarkdownContent } from "@/components/markdown-content";

type MarkdownEditorProps = {
  name: string;
  initialValue?: string;
};

type EditorMode = "edit" | "preview";

type ToolbarAction = {
  label: string;
  title: string;
  before: string;
  after?: string;
  placeholder?: string;
};

const defaultMarkdown = `## 问题背景

请描述你的机器人项目、硬件环境或软件版本。

### 已经尝试

- [ ] 检查供电
- [ ] 查看日志
- [ ] 简化复现代码

| 模块 | 当前状态 |
| --- | --- |
| 控制板 | 待说明 |
| 传感器 | 待说明 |

\`\`\`ts
console.log("robot forum");
\`\`\`
`;

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
    placeholder: 'console.log("robot forum");',
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

export function MarkdownEditor({
  name,
  initialValue = defaultMarkdown,
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(initialValue);
  const [mode, setMode] = useState<EditorMode>("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const wordCount = useMemo(
    () => markdown.trim().split(/\s+/).filter(Boolean).length,
    [markdown],
  );

  function focusCurrentMode(nextMode: EditorMode) {
    window.requestAnimationFrame(() => {
      if (nextMode === "edit") {
        textareaRef.current?.focus();
        return;
      }

      previewRef.current?.focus();
    });
  }

  function switchMode(nextMode: EditorMode) {
    setMode(nextMode);
    focusCurrentMode(nextMode);
  }

  function toggleMode() {
    const nextMode = mode === "edit" ? "preview" : "edit";
    switchMode(nextMode);
  }

  function insertMarkdown(action: ToolbarAction) {
    const textarea = textareaRef.current;
    const selectedText = textarea
      ? markdown.slice(textarea.selectionStart, textarea.selectionEnd)
      : "";
    const content = selectedText || action.placeholder || "";
    const after = action.after ?? "";
    const nextText = action.before + content + after;

    if (!textarea) {
      setMarkdown((current) => current + nextText);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextMarkdown =
      markdown.slice(0, start) + nextText + markdown.slice(end);
    const nextCursor = start + action.before.length + content.length;

    setMarkdown(nextMarkdown);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    toggleMode();
  }

  return (
    <div
      className="rounded-lg border border-[#d8dee6] bg-white"
      onKeyDown={handleEditorKeyDown}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8dee6] px-4 py-3">
        <div>
          <label htmlFor={name} className="text-sm font-semibold">
            Markdown 正文
          </label>
          <p className="mt-1 text-xs text-[#667085]">
            光标在编辑器内时，按 Tab 在编辑和预览之间切换
          </p>
        </div>

        <div className="flex rounded-md border border-[#cfd6df] bg-[#f8fafb] p-1">
          <button
            type="button"
            onClick={() => switchMode("edit")}
            className={`rounded px-3 py-1.5 text-xs font-semibold ${
              mode === "edit"
                ? "bg-white text-[#24706f] shadow-sm"
                : "text-[#667085]"
            }`}
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => switchMode("preview")}
            className={`rounded px-3 py-1.5 text-xs font-semibold ${
              mode === "preview"
                ? "bg-white text-[#24706f] shadow-sm"
                : "text-[#667085]"
            }`}
          >
            预览
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <>
          <div className="flex flex-wrap gap-2 border-b border-[#edf0f3] bg-[#fbfcfd] px-4 py-3">
            {toolbarActions.map((action) => (
              <button
                key={action.title}
                type="button"
                title={action.title}
                onClick={() => insertMarkdown(action)}
                className="min-h-8 rounded-md border border-[#cfd6df] bg-white px-2.5 text-xs font-semibold text-[#3f4754] hover:border-[#24706f] hover:text-[#24706f]"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            <textarea
              ref={textareaRef}
              id={name}
              name={name}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              className="min-h-[620px] w-full resize-y rounded-md border border-[#cfd6df] bg-[#fbfcfd] px-3 py-3 font-mono text-sm leading-6 outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
              required
            />
            <div className="mt-2 flex justify-end text-xs text-[#667085]">
              <span>{wordCount} words</span>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4">
          <input type="hidden" name={name} value={markdown} />
          <div
            ref={previewRef}
            tabIndex={0}
            className="min-h-[620px] rounded-md border border-[#edf0f3] bg-white p-4 outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
          >
            <div className="space-y-5 text-sm leading-7 text-[#3f4754]">
              <MarkdownContent source={markdown} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
