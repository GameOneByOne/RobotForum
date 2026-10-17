import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const code = ts.transpileModule(
  readFileSync(
    new URL("../lib/knowledge/learning-path.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const loaded = { exports: {} };
new Function("exports", "module", code)(loaded.exports, loaded);
const {
  getLearningMetadata,
  compareLearningOrder,
  parseLearningInput,
  isLearningOrderTag,
} = loaded.exports;

test("legacy classification tags override the old default database level", () => {
  assert.deepEqual(
    getLearningMetadata({
      difficulty: "Beginner",
      tags: ["ROS", "中级", "学习顺序07"],
    }),
    { level: "intermediate", order: 7 },
  );
  assert.deepEqual(
    getLearningMetadata({ difficulty: "Advanced", tags: ["研究"] }),
    { level: "advanced", order: null },
  );
});

test("unordered reading follows ordered lessons and ties have deterministic ordering", () => {
  const items = [
    { title: "B", slug: "b", tags: [] },
    { title: "C", slug: "c", tags: ["学习顺序12"] },
    { title: "A", slug: "a", tags: ["学习顺序02"] },
  ];
  assert.deepEqual(
    items.sort(compareLearningOrder).map((item) => item.slug),
    ["a", "c", "b"],
  );
  assert.notEqual(
    compareLearningOrder(
      { title: "same", slug: "a", tags: [] },
      { title: "same", slug: "b", tags: [] },
    ),
    0,
  );
});

test("changing level replaces previous metadata while preserving topic tags", () => {
  const form = new FormData();
  form.set("difficulty", "advanced");
  form.set("learningOrder", "13");
  assert.deepEqual(parseLearningInput(form, ["MoveIt", "初级", "学习顺序03"]), {
    level: "advanced",
    tags: ["MoveIt", "高级"],
  });
  form.set("learningOrder", "");
  assert.deepEqual(parseLearningInput(form, ["高级", "学习顺序13"]).tags, [
    "高级",
  ]);
});

test("older editor submissions cannot recreate learning-order tags", () => {
  for (const value of ["13", "-1", "1.5", "abc", "10000", "0"]) {
    const form = new FormData();
    form.set("learningOrder", value);
    assert.deepEqual(
      parseLearningInput(form, ["ROS", "中级", "学习顺序07", "学习顺序"]).tags,
      ["ROS", "中级"],
    );
  }
  for (const tag of ["学习顺序", "学习顺序01", "学习顺序 12", " 学习顺序03 "])
    assert.equal(isLearningOrderTag(tag), true);
  assert.equal(isLearningOrderTag("ROS 2"), false);
});
