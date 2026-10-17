"use client";

import { useI18n } from "@/components/language-provider";

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
  const { t } = useI18n();
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
            (isCommand
              ? t("终端命令")
              : isOutput
                ? t("文本 / 输出")
                : t("代码示例"))}
        </span>
        <span className="markdown-code-language">{language}</span>
        <button
          type="button"
          aria-pressed={wrap}
          onClick={() => setWrap(!wrap)}
        >
          {wrap ? t("取消换行") : t("自动换行")}
        </button>
        <button type="button" onClick={copy}>
          {t("复制")}
        </button>
        <span className="markdown-code-status" role="status">
          {t(copyState)}
        </span>
      </div>
      <div
        className="markdown-code-scroll"
        style={{ maxHeight: long && !expanded ? 360 : undefined }}
        tabIndex={0}
        aria-label={t("代码内容，可滚动")}
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
            ? t("收起代码")
            : t("展开完整代码 · {0} 行", { "0": code.split("\n").length })}
        </button>
      )}
    </div>
  );
}
