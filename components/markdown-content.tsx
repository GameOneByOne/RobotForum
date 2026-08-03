import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  source: string;
};

type CodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

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

export function MarkdownContent({ source }: MarkdownContentProps) {
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
