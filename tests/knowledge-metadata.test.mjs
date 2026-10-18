import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const code = ts.transpileModule(
  readFileSync(new URL("../lib/knowledge/presentation.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const loaded = { exports: {} };
new Function("exports", code)(loaded.exports);
const { formatKnowledgeTimestamp } = loaded.exports;

test("knowledge timestamps use Beijing time with minute precision across date boundaries", () => {
  assert.equal(formatKnowledgeTimestamp("2026-10-17T16:05:59Z"), "2026-10-18 00:05");
  assert.equal(formatKnowledgeTimestamp("2026-12-31T16:00:00Z"), "2027-01-01 00:00");
  assert.equal(formatKnowledgeTimestamp("2026-10-18T10:09:01+08:00"), "2026-10-18 10:09");
});

test("missing or invalid knowledge timestamps have a readable fallback", () => {
  for (const value of [null, "", "invalid"]) assert.equal(formatKnowledgeTimestamp(value), "—");
});
