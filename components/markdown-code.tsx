"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function MarkdownCode({
  code,
  language = "text",
  title,
  large = false,
}: {
  code: string;
  language?: string;
  title?: string;
  large?: boolean;
}) {
  const [copyState, setCopyState] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [wrap, setWrap] = useState(false);
  const long = code.split("\n").length > 16;
  const isCommand = /^(bash|sh|shell|zsh|powershell|console)$/.test(language);
  const isOutput = /^(text|plaintext|output)$/.test(language);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("已复制");
    } catch {
      setCopyState("复制失败，请选择代码后复制");
    }
  }
  return (
    <div className="markdown-code">
      <div className="markdown-code-toolbar">
        <span className="markdown-code-label">
          {title ||
            (isCommand ? "终端命令" : isOutput ? "文本 / 输出" : "代码示例")}
        </span>
        <span className="markdown-code-language">{language}</span>
        <button
          type="button"
          aria-pressed={wrap}
          onClick={() => setWrap(!wrap)}
        >
          {wrap ? "取消换行" : "自动换行"}
        </button>
        <button type="button" onClick={copy}>
          复制
        </button>
        <span className="markdown-code-status" role="status">
          {copyState}
        </span>
      </div>
      <div
        className="markdown-code-scroll"
        style={{ maxHeight: long && !expanded ? 360 : undefined }}
        tabIndex={0}
        aria-label="代码内容，可滚动"
      >
        <SyntaxHighlighter
          language={language === "output" ? "text" : language}
          PreTag="div"
          style={oneDark}
          wrapLongLines={wrap}
          showLineNumbers={
            !isCommand && !isOutput && code.split("\n").length > 3
          }
          customStyle={{
            margin: 0,
            padding: "18px",
            background: "transparent",
            fontSize: large ? "16px" : "14px",
            lineHeight: 1.7,
          }}
          codeTagProps={{ style: { fontFamily: "var(--font-code)" } }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      {long && (
        <button
          className="markdown-code-expand"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? "收起代码"
            : `展开完整代码 · ${code.split("\n").length} 行`}
        </button>
      )}
    </div>
  );
}
