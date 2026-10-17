"use client";

import { useI18n } from "@/components/language-provider";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { MarkdownCode } from "@/components/markdown-code";
import { MarkdownImage } from "@/components/markdown-image";
import { readingOutline } from "@/lib/markdown/outline";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  size?: "normal" | "large";
  source: string;
};

type CodeTab = {
  title: string;
  language: string;
  code: string;
};

type MarkdownSegment =
  | {
      content: string;
      type: "markdown";
    }
  | {
      tabs: CodeTab[];
      type: "code-tabs";
    };

type CodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

const codeTabsBlockPattern = /^:::code-tabs\s*\n([\s\S]*?)\n:::\s*$/gm;
const fencedCodePattern =
  /^```([A-Za-z0-9_-]+)?(?:\s+title=(?:"([^"]+)"|'([^']+)'|([^\s]+)))?\s*\n([\s\S]*?)\n```\s*$/gm;

function CodeBlock({ children, className, ...props }: CodeProps) {
  return (
    <code {...props} className={className}>
      {children}
    </code>
  );
}

function PreBlock({
  children,
}: ComponentPropsWithoutRef<"pre"> & { node?: unknown }) {
  if (
    !isValidElement<{
      className?: string;
      children?: ReactNode;
      "data-title"?: string;
    }>(children)
  )
    return <pre>{children}</pre>;
  if (/math-display/.test(children.props.className || ""))
    return <div className="markdown-formula">{children}</div>;
  const language =
    /language-([\w+-]+)/.exec(children.props.className || "")?.[1] || "text";
  return (
    <MarkdownCode
      key={String(children.props.children)}
      code={String(children.props.children).replace(/\n$/, "")}
      language={language}
      title={children.props["data-title"]}
    />
  );
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (isValidElement<{ children?: ReactNode }>(node))
    return nodeText(node.props.children);
  return Children.toArray(node)
    .map((child) =>
      isValidElement<{ children?: ReactNode }>(child)
        ? nodeText(child.props.children)
        : String(child),
    )
    .join("");
}

function Callout({ children }: ComponentPropsWithoutRef<"blockquote">) {
  const { t } = useI18n();
  const marker = /^\[!(NOTE|TIP|WARNING|CONCEPT|EXAMPLE|MISCONCEPTION)\]\s*/;
  const text = nodeText(children).trimStart();
  const kind = marker.exec(text)?.[1];
  if (!kind) return <blockquote>{children}</blockquote>;
  const labels: Record<string, string> = {
    NOTE: "说明",
    TIP: "提示",
    WARNING: "注意",
    CONCEPT: "概念解释",
    EXAMPLE: "具体例子",
    MISCONCEPTION: "常见误解",
  };
  function strip(node: ReactNode): ReactNode {
    if (typeof node === "string" && marker.test(node.trimStart())) {
      return node.trimStart().replace(marker, "");
    }
    if (isValidElement<{ children?: ReactNode }>(node))
      return cloneElement(node, {}, Children.map(node.props.children, strip));
    return node;
  }
  return (
    <aside
      className={`markdown-callout markdown-callout-${kind.toLowerCase()}`}
      aria-label={t(labels[kind])}
    >
      <strong className="markdown-callout-title">{t(labels[kind])}</strong>
      {Children.map(children, strip)}
    </aside>
  );
}

// Expose fence titles only as text, with user HTML still sanitized before math rendering.
function remarkCodeTitles() {
  return (tree: {
    type: string;
    meta?: string;
    data?: { hProperties?: Record<string, unknown> };
    children?: unknown[];
  }) => {
    function visit(node: typeof tree) {
      if (node.type === "code" && node.meta) {
        const title = /(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|(\S+))/.exec(
          node.meta,
        );
        if (title)
          node.data = {
            ...node.data,
            hProperties: {
              ...node.data?.hProperties,
              "data-title": title[1] || title[2] || title[3],
            },
          };
      }
      node.children?.forEach((child) => visit(child as typeof tree));
    }
    visit(tree);
  };
}

function parseCodeTabs(value: string): CodeTab[] {
  const tabs: CodeTab[] = [];

  for (const match of value.matchAll(fencedCodePattern)) {
    const language = match[1] || "text";
    const title = match[2] || match[3] || match[4] || language.toUpperCase();

    tabs.push({
      title,
      language,
      code: match[5].replace(/\n$/, ""),
    });
  }

  return tabs;
}

function parseMarkdownSegments(source: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  let cursor = 0;

  for (const match of source.matchAll(codeTabsBlockPattern)) {
    const start = match.index ?? 0;
    const markdown = source.slice(cursor, start);

    if (markdown.trim()) {
      segments.push({
        type: "markdown",
        content: markdown,
      });
    }

    const tabs = parseCodeTabs(match[1]);

    if (tabs.length) {
      segments.push({
        type: "code-tabs",
        tabs,
      });
    } else {
      segments.push({
        type: "markdown",
        content: match[0],
      });
    }

    cursor = start + match[0].length;
  }

  const remainingMarkdown = source.slice(cursor);

  if (remainingMarkdown.trim() || !segments.length) {
    segments.push({
      type: "markdown",
      content: remainingMarkdown,
    });
  }

  return segments;
}

function CodeTabs({
  size = "normal",
  tabs,
}: {
  size?: MarkdownContentProps["size"];
  tabs: CodeTab[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = tabs[activeIndex] ?? tabs[0];
  const isLarge = size === "large";

  if (!activeTab) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-canvas">
      <div className="flex min-h-10 gap-1 overflow-x-auto border-b border-line bg-raised px-2 pt-2">
        {tabs.map((tab, index) => {
          const isActive = tab === activeTab;

          return (
            <button
              key={`${tab.title}-${index}`}
              type="button"
              aria-current={isActive ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
              className={`rounded-t-md px-3 py-1.5 font-semibold transition ${
                isLarge ? "text-base" : "text-xs"
              } ${
                isActive
                  ? "bg-canvas text-ink"
                  : "text-secondary hover:bg-panel/60 hover:text-accent"
              }`}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
      <MarkdownCode
        key={`${activeIndex}-${activeTab.title}`}
        code={activeTab.code}
        language={activeTab.language}
        title={activeTab.title}
        large={isLarge}
      />
    </div>
  );
}

function MarkdownRenderer({
  size = "normal",
  source,
  headingOffset = 0,
}: MarkdownContentProps & { headingOffset?: number }) {
  const { t } = useI18n();
  const outline = readingOutline(source, headingOffset);
  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [
        ...(defaultSchema.attributes?.code || []),
        ["className", /^language-./, "math-inline", "math-display"],
        "data-title",
      ],
    },
  };
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        remarkBreaks,
        [remarkMath, { singleDollarTextMath: false }],
        remarkCodeTitles,
      ]}
      rehypePlugins={[
        [rehypeSanitize, schema],
        [
          rehypeKatex,
          { trust: false, strict: "ignore", maxExpand: 1000, maxSize: 10 },
        ],
      ]}
      components={{
        a: (props) => (
          <a
            {...props}
            className="font-medium text-accent underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          />
        ),
        blockquote: Callout,
        code: ({ node: _node, ...props }) => <CodeBlock {...props} />,
        img: ({ node: _node, ...props }) => (
          <MarkdownImage key={String(props.src)} {...props} />
        ),
        pre: PreBlock,
        h1: ({ node, ...props }) => (
          <h1
            {...props}
            id={outline.find((h) => h.line === node?.position?.start.line)?.id}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            {...props}
            id={outline.find((h) => h.line === node?.position?.start.line)?.id}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            {...props}
            id={outline.find((h) => h.line === node?.position?.start.line)?.id}
          />
        ),
        h4: ({ node, ...props }) => (
          <h4
            {...props}
            id={outline.find((h) => h.line === node?.position?.start.line)?.id}
          />
        ),
        h5: ({ node, ...props }) => (
          <h5
            {...props}
            id={outline.find((h) => h.line === node?.position?.start.line)?.id}
          />
        ),
        h6: ({ node, ...props }) => (
          <h6
            {...props}
            id={outline.find((h) => h.line === node?.position?.start.line)?.id}
          />
        ),
        ol: (props) => <ol {...props} className="list-decimal pl-6" />,
        ul: (props) => <ul {...props} className="list-disc pl-6" />,
        table: ({ node: _node, ...props }) => (
          <div
            className="markdown-table-scroll"
            role="region"
            aria-label={t("数据表格，可横向滚动")}
            tabIndex={0}
          >
            <table {...props} />
          </div>
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
}

export function MarkdownContent({
  size = "normal",
  source,
}: MarkdownContentProps) {
  const segments = parseMarkdownSegments(source);

  return (
    <div
      className={`markdown-body${size === "large" ? " markdown-body-large" : ""}`}
    >
      {segments.map((segment, index) => {
        if (segment.type === "code-tabs")
          return (
            <CodeTabs
              key={`code-tabs-${index}`}
              size={size}
              tabs={segment.tabs}
            />
          );
        const offset = segments
          .slice(0, index)
          .reduce(
            (count, previous) =>
              count +
              (previous.type === "markdown"
                ? readingOutline(previous.content).length
                : 0),
            0,
          );
        return (
          <MarkdownRenderer
            key={`markdown-${index}`}
            size={size}
            source={segment.content}
            headingOffset={offset}
          />
        );
      })}
    </div>
  );
}
