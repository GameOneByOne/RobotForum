"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  source: string;
};

type CodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

type MarkdownSegment =
  | {
      type: "markdown";
      content: string;
    }
  | {
      type: "tabs";
      tabs: MarkdownTab[];
    };

type MarkdownTab = {
  title: string;
  content: string;
};

function preserveSingleLineBreaks(source: string) {
  let inFence = false;
  const lines = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  function isBlockSyntax(line: string) {
    return /^(\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|\|)|\s*---+\s*$)/.test(
      line,
    );
  }

  function isDirective(line: string) {
    return /^\s*(:::|<!--\s*\/?tabs?\b|<!--\s*tab:)/.test(line);
  }

  return lines
    .map((line, index) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }

      if (inFence || !line.trim()) {
        return line;
      }

      const nextLine = lines[index + 1] ?? "";

      if (
        !nextLine.trim() ||
        isDirective(line) ||
        isDirective(nextLine) ||
        isBlockSyntax(line) ||
        isBlockSyntax(nextLine)
      ) {
        return line;
      }

      return `${line.replace(/[ \t]+$/, "")}\\`;
    })
    .join("\n");
}

function parseTabbedMarkdown(source: string): MarkdownSegment[] {
  const normalizedSource = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const htmlTabBlockPattern =
    /<!--\s*tabs\s*-->([\s\S]*?)<!--\s*\/tabs\s*-->/g;
  const segments: MarkdownSegment[] = [];
  let lastIndex = 0;

  for (const match of normalizedSource.matchAll(htmlTabBlockPattern)) {
    const blockStart = match.index ?? 0;
    const blockEnd = blockStart + match[0].length;
    const before = normalizedSource.slice(lastIndex, blockStart).trim();

    if (before) {
      segments.push({ type: "markdown", content: before });
    }

    const tabs = parseHtmlTabs(match[1]);

    if (tabs.length) {
      segments.push({ type: "tabs", tabs });
    }

    lastIndex = blockEnd;
  }

  const after = normalizedSource.slice(lastIndex).trim();

  if (after) {
    segments.push({ type: "markdown", content: after });
  }

  if (segments.length) {
    return segments;
  }

  return parseColonTabs(normalizedSource);
}

function parseHtmlTabs(source: string): MarkdownTab[] {
  const tabPattern =
    /<!--\s*tab:\s*(.+?)\s*-->([\s\S]*?)<!--\s*\/tab\s*-->/g;

  return Array.from(source.matchAll(tabPattern)).map((match) => ({
    title: match[1].trim(),
    content: match[2].trim(),
  }));
}

function parseColonTabs(source: string): MarkdownSegment[] {
  const lines = source.split("\n");
  const segments: MarkdownSegment[] = [];
  let markdownBuffer: string[] = [];
  let inFence = false;
  let index = 0;

  function flushMarkdown() {
    const content = markdownBuffer.join("\n").trim();

    if (content) {
      segments.push({ type: "markdown", content });
    }

    markdownBuffer = [];
  }

  while (index < lines.length) {
    const line = lines[index];

    if (/^\s*:::tabs\s*$/.test(line)) {
      const tabs: MarkdownTab[] = [];
      let currentTab: MarkdownTab | undefined;
      let inTabFence = false;

      flushMarkdown();
      index += 1;

      while (index < lines.length) {
        const tabLine = lines[index];
        const tabStart =
          /^:::tab\s+(.+)$/.exec(tabLine.trim()) ??
          /^<!--\s*tab:\s*(.+?)\s*-->\s*$/.exec(tabLine.trim());

        if (/^\s*```/.test(tabLine)) {
          inTabFence = !inTabFence;
          currentTab?.content && (currentTab.content += "\n");
          if (currentTab) {
            currentTab.content += tabLine;
          }
          index += 1;
          continue;
        }

        if (!inTabFence && tabStart) {
          currentTab = {
            title: tabStart[1].trim(),
            content: "",
          };
          tabs.push(currentTab);
          index += 1;
          continue;
        }

        if (
          !inTabFence &&
          (tabLine.trim() === ":::" ||
            /^<!--\s*(\/tab|\/tabs)\s*-->\s*$/.test(tabLine.trim()))
        ) {
          if (currentTab) {
            currentTab.content = currentTab.content.trim();
            currentTab = undefined;
            index += 1;
            continue;
          }

          index += 1;
          break;
        }

        if (currentTab) {
          currentTab.content = currentTab.content
            ? `${currentTab.content}\n${tabLine}`
            : tabLine;
        }

        index += 1;
      }

      if (tabs.length) {
        segments.push({ type: "tabs", tabs });
      }

      continue;
    }

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      markdownBuffer.push(line);
      index += 1;
      continue;
    }

    markdownBuffer.push(line);
    index += 1;
  }

  flushMarkdown();

  return segments;
}

function CodeBlock({ inline, className, children, ...props }: CodeProps) {
  const match = /language-(\w+)/.exec(className ?? "");
  const language = match?.[1];
  const code = String(children).replace(/\n$/, "");

  if (!inline && language) {
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

  if (!inline) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-[#d8dee6] bg-[#fbfcfd] p-4">
        <code
          {...props}
          className="font-mono text-sm leading-7 text-[#171a20]"
        >
          {children}
        </code>
      </pre>
    );
  }

  return (
    <code
      {...props}
      className="rounded bg-[#eef2f6] px-1.5 py-0.5 font-mono text-sm text-[#171a20]"
    >
      {children}
    </code>
  );
}

function MarkdownBlock({ source }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
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
        p: (props) => (
          <p {...props} className="whitespace-pre-wrap leading-7" />
        ),
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
      {preserveSingleLineBreaks(source)}
    </ReactMarkdown>
  );
}

function MarkdownTabs({ tabs }: { tabs: MarkdownTab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = tabs[activeIndex] ?? tabs[0];

  return (
    <div className="overflow-hidden rounded-lg border border-[#d8dee6] bg-white">
      <div className="flex flex-wrap gap-1 border-b border-[#d8dee6] bg-[#f0f3f6] p-2">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={`${tab.title}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-[#24706f] text-white"
                  : "text-[#3f4754] hover:bg-white"
              }`}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
      <div className="p-4">
        <div className="space-y-5 text-sm leading-7 text-[#3f4754]">
          <MarkdownContent source={activeTab.content} />
        </div>
      </div>
    </div>
  );
}

export function MarkdownContent({ source }: MarkdownContentProps) {
  const segments = parseTabbedMarkdown(source);

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "tabs" ? (
          <MarkdownTabs key={index} tabs={segment.tabs} />
        ) : (
          <MarkdownBlock key={index} source={segment.content} />
        ),
      )}
    </>
  );
}
