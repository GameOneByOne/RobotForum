"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { isValidElement } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
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

type ImagePlacement = "block" | "left" | "right";

type ImageOptions = {
  alt: string;
  placement: ImagePlacement;
  size: number;
};

const codeTabsBlockPattern = /^:::code-tabs\s*\n([\s\S]*?)\n:::\s*$/gm;
const fencedCodePattern =
  /^```([A-Za-z0-9_-]+)?(?:\s+title=(?:"([^"]+)"|'([^']+)'|([^\s]+)))?\s*\n([\s\S]*?)\n```\s*$/gm;

function hasMultilineContent(children: ReactNode) {
  return String(children).includes("\n");
}

function normalizeImagePlacement(value: string | undefined): ImagePlacement {
  const placement = value?.trim().toLowerCase();

  if (placement === "left" || placement === "inline-left" || placement === "左") {
    return "left";
  }

  if (placement === "right" || placement === "inline-right" || placement === "右") {
    return "right";
  }

  return "block";
}

function parseImageOptions(alt = ""): ImageOptions {
  const [label = "", sizeValue, placementValue] = alt.split("|");
  const parsedSize = Number.parseFloat(sizeValue ?? "");
  const size = Number.isFinite(parsedSize)
    ? Math.min(Math.max(parsedSize, 0), 100)
    : 100;

  return {
    alt: label.trim(),
    placement: normalizeImagePlacement(placementValue),
    size,
  };
}

function CodeBlock({ className, children, ...props }: CodeProps) {
  const match = /language-(\w+)/.exec(className ?? "");
  const language = match?.[1];
  const code = String(children).replace(/\n$/, "");

  if (language) {
    return (
      <div className="overflow-hidden rounded-lg border border-[#d8dee6] bg-[#fbfcfd]">
        <div className="flex min-h-9 items-center justify-between border-b border-[#d8dee6] bg-[#f0f3f6] px-3 text-xs font-medium text-[#526071]">
          <span>代码</span>
          <span className="font-mono uppercase">{language}</span>
        </div>
        <SyntaxHighlighter
          {...props}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            background: "#fbfcfd",
            padding: "16px",
            fontSize: "13px",
            lineHeight: "1.7",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            },
          }}
          style={oneLight}
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code
      {...props}
      className={
        hasMultilineContent(children)
          ? "block whitespace-pre-wrap font-mono text-sm leading-7 text-[#171a20]"
          : "rounded bg-[#eef2f6] px-1.5 py-0.5 font-mono text-sm text-[#171a20]"
      }
    >
      {children}
    </code>
  );
}

function PreBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  if (
    isValidElement<{ className?: string }>(children) &&
    /language-(\w+)/.test(children.props.className ?? "")
  ) {
    return children;
  }

  return (
    <pre
      {...props}
      className="overflow-x-auto rounded-lg border border-[#d8dee6] bg-[#fbfcfd] p-4"
    >
      {children}
    </pre>
  );
}

function MarkdownImage({
  alt,
  src,
  title,
}: ComponentPropsWithoutRef<"img">) {
  const options = parseImageOptions(alt);
  const width = `${options.size}%`;
  const image = (
    // Markdown images can point to arbitrary user-provided remote URLs.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={options.alt}
      src={src}
      title={title}
      className="h-auto w-full rounded-md border border-[#d8dee6]"
    />
  );

  if (options.placement === "left") {
    return (
      <span
        className="float-left mr-4 mb-3 inline-block max-w-full"
        style={{ width }}
      >
        {image}
      </span>
    );
  }

  if (options.placement === "right") {
    return (
      <span
        className="float-right mb-3 ml-4 inline-block max-w-full"
        style={{ width }}
      >
        {image}
      </span>
    );
  }

  return (
    <span className="mx-auto my-4 block max-w-full" style={{ width }}>
      {image}
    </span>
  );
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

function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = tabs[activeIndex] ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#d8dee6] bg-[#fbfcfd]">
      <div className="flex min-h-10 gap-1 overflow-x-auto border-b border-[#d8dee6] bg-[#f0f3f6] px-2 pt-2">
        {tabs.map((tab, index) => {
          const isActive = tab === activeTab;

          return (
            <button
              key={`${tab.title}-${index}`}
              type="button"
              aria-current={isActive ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
              className={`rounded-t-md px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-[#fbfcfd] text-[#171a20]"
                  : "text-[#526071] hover:bg-white/60 hover:text-[#24706f]"
              }`}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
      <SyntaxHighlighter
        language={activeTab.language}
        PreTag="div"
        customStyle={{
          margin: 0,
          background: "#fbfcfd",
          padding: "16px",
          fontSize: "13px",
          lineHeight: "1.7",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          },
        }}
        style={oneLight}
        wrapLongLines
      >
        {activeTab.code}
      </SyntaxHighlighter>
    </div>
  );
}

function MarkdownRenderer({ source }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        a: (props) => (
          <a
            {...props}
            className="font-medium text-[#24706f] underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          />
        ),
        blockquote: (props) => (
          <blockquote
            {...props}
            className="border-l-4 border-[#b7cfcd] pl-4 text-[#526071]"
          />
        ),
        code: CodeBlock,
        img: MarkdownImage,
        pre: PreBlock,
        h1: (props) => (
          <h1 {...props} className="text-3xl font-bold leading-tight" />
        ),
        h2: (props) => (
          <h2 {...props} className="text-2xl font-bold leading-tight" />
        ),
        h3: (props) => (
          <h3 {...props} className="text-xl font-semibold leading-tight" />
        ),
        ol: (props) => <ol {...props} className="list-decimal pl-6" />,
        ul: (props) => <ul {...props} className="list-disc pl-6" />,
        table: (props) => (
          <div className="overflow-x-auto">
            <table
              {...props}
              className="w-full min-w-[520px] border-collapse text-left text-sm"
            />
          </div>
        ),
        th: (props) => (
          <th
            {...props}
            className="border border-[#d8dee6] bg-[#f0f3f6] px-3 py-2 font-semibold"
          />
        ),
        td: (props) => (
          <td {...props} className="border border-[#d8dee6] px-3 py-2" />
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
}

export function MarkdownContent({ source }: MarkdownContentProps) {
  const segments = parseMarkdownSegments(source);

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "code-tabs" ? (
          <CodeTabs key={`code-tabs-${index}`} tabs={segment.tabs} />
        ) : (
          <MarkdownRenderer key={`markdown-${index}`} source={segment.content} />
        ),
      )}
    </>
  );
}
