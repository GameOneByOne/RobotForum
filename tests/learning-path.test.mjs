import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../lib/knowledge/learning-path.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function("exports", "module", code)(loaded.exports, loaded);
const { getLearningMetadata, compareLearningOrder, parseLearningInput } = loaded.exports;

test("legacy classification tags override the old default database level", () => {
  assert.deepEqual(getLearningMetadata({ difficulty: "Beginner", tags: ["ROS", "中级", "学习顺序07"] }), { level: "intermediate", order: 7 });
  assert.deepEqual(getLearningMetadata({ difficulty: "Advanced", tags: ["研究"] }), { level: "advanced", order: null });
});

test("unordered reading follows ordered lessons and ties have deterministic ordering", () => {
  const items = [{ title: "B", slug: "b", tags: [] }, { title: "C", slug: "c", tags: ["学习顺序12"] }, { title: "A", slug: "a", tags: ["学习顺序02"] }];
  assert.deepEqual(items.sort(compareLearningOrder).map((item) => item.slug), ["a", "c", "b"]);
  assert.notEqual(compareLearningOrder({ title: "same", slug: "a", tags: [] }, { title: "same", slug: "b", tags: [] }), 0);
});

test("changing level replaces previous metadata while preserving topic tags", () => {
  const form = new FormData();
  form.set("difficulty", "advanced");
  form.set("learningOrder", "13");
  assert.deepEqual(parseLearningInput(form, ["MoveIt", "初级", "学习顺序03"]), { level: "advanced", tags: ["MoveIt", "高级", "学习顺序13"] });
  form.set("learningOrder", "");
  assert.deepEqual(parseLearningInput(form, ["高级", "学习顺序13"]).tags, ["高级"]);
});

test("invalid sequence numbers fail before persistence", () => {
  for (const value of ["-1", "1.5", "abc", "10000", "0"]) {
    const form = new FormData(); form.set("learningOrder", value);
    assert.throws(() => parseLearningInput(form, []));
  }
});
