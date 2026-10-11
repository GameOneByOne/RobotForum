import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const code = ts.transpileModule(
  readFileSync(new URL("../lib/markdown/outline.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const loaded = { exports: {} };
new Function("exports", "module", code)(loaded.exports, loaded);
const { readingOutline } = loaded.exports;

test("examples, code tabs and display math do not create phantom navigation entries", () => {
  const source =
    "# 原理\n\n```python\n# 注释\n```\n\n~~~text\n## 示例里的标题\n~~~\n\n$$\nx\n=\ny\n$$\n\n:::code-tabs\n```text\n# 标签中的内容\n```\n:::\n\n## 结果";
  assert.deepEqual(
    readingOutline(source).map((h) => h.title),
    ["原理", "结果"],
  );
});

test("repeated headings and headings after a code-tab segment have distinct stable anchors", () => {
  const first = readingOutline("## 相同标题\n\n## 相同标题");
  const next = readingOutline("## 后续说明", first.length);
  assert.deepEqual(
    [...first, ...next].map((h) => h.id),
    ["reading-heading-1", "reading-heading-2", "reading-heading-3"],
  );
});

test("heading text preserves Chinese, trims formatting and records source lines", () => {
  assert.deepEqual(
    readingOutline("\n## **坐标**与[方向](https://example.com) ##")[0],
    { title: "坐标与方向", level: 2, line: 2, id: "reading-heading-1" },
  );
  assert.equal(readingOutline("坐标系\n===")[0].level, 1);
});
