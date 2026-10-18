import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import { createClient } from "@supabase/supabase-js";

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

test("legacy form classifications are discarded while topic tags are preserved", () => {
  const form = new FormData();
  form.set("difficulty", "advanced");
  form.set("learningOrder", "13");
  assert.deepEqual(parseLearningInput(form, ["MoveIt", "初级", "学习顺序03"]), {
    tags: ["MoveIt"],
  });
  form.set("learningOrder", "");
  assert.deepEqual(parseLearningInput(form, ["高级", "学习顺序13"]).tags, []);
  assert.deepEqual(parseLearningInput(form, [" 初级 ", "中级", "高级", "ROS 2"]), {
    tags: ["ROS 2"],
  });
});

test("older editor submissions cannot recreate learning-order tags", () => {
  for (const value of ["13", "-1", "1.5", "abc", "10000", "0"]) {
    const form = new FormData();
    form.set("learningOrder", value);
    assert.deepEqual(
      parseLearningInput(form, ["ROS", "中级", "学习顺序07", "学习顺序"]).tags,
      ["ROS"],
    );
  }
  for (const tag of ["学习顺序", "学习顺序01", "学习顺序 12", " 学习顺序03 "])
    assert.equal(isLearningOrderTag(tag), true);
  assert.equal(isLearningOrderTag("ROS 2"), false);
});

function knowledgeActions({ deleteError = false, displayName = "真实昵称" } = {}) {
  const requests = [];
  const client = createClient("https://example.supabase.co", "public-test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, options = {}) => {
        const url = new URL(input);
        const method = options.method ?? "GET";
        requests.push({
          url,
          method,
          body: options.body ? JSON.parse(options.body) : null,
          headers: new Headers(options.headers),
        });
        if (url.pathname.endsWith("/knowledge_tags") && method === "DELETE") {
          return deleteError
            ? new Response(JSON.stringify({ message: "permission denied", code: "42501" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
              })
            : new Response(null, { status: 204 });
        }
        const data = url.pathname.endsWith("/knowledge")
          ? { id: "article-id", slug: "permanent-original-slug" }
          : url.pathname.endsWith("/tags") && method === "GET"
            ? [{ id: "topic-id", name: "ROS 2" }]
            : null;
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  });
  const mocks = {
    "@/lib/knowledge/learning-path": loaded.exports,
    "@/lib/auth/session": {
      requireCurrentUser: async () => ({ id: "real-user-id", displayName, email: "real@example.com" }),
      displayNameFromEmail: (email) => email.split("@")[0] || "注册用户",
    },
    "@/lib/supabase/env": { hasSupabaseEnv: () => true },
    "@/lib/supabase/server": { createClient: async () => client },
    "next/cache": { revalidatePath: () => {} },
    "next/navigation": { redirect: (path) => { throw new Error(`redirect:${path}`); } },
  };
  const require = createRequire(import.meta.url);
  const code = ts.transpileModule(
    readFileSync(new URL("../lib/knowledge/actions.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText;
  const actionsModule = { exports: {} };
  new Function("require", "exports", "module", code)(
    (name) => mocks[name] ?? require(name), actionsModule.exports, actionsModule,
  );
  return { requests, ...actionsModule.exports };
}

function knowledgeForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    id: "article-id",
    slug: "untrusted-submitted-slug",
    title: "改过的标题",
    summary: "摘要",
    content: "## 原理\n正文",
    difficulty: "advanced",
    learningOrder: "99",
    tags: JSON.stringify(["ROS 2", "初级", "学习顺序01"]),
    author_id: "forged-user-id",
    author_name: "伪造昵称",
    created_at: "2000-01-01",
    updated_at: "2000-01-01",
  })) form.set(key, value);
  return form;
}

test("updating an article keeps its permanent URL and only writes authenticated author metadata", async () => {
  const { requests, saveKnowledgeUpdate } = knowledgeActions();
  assert.deepEqual(await saveKnowledgeUpdate(knowledgeForm()), { slug: "permanent-original-slug" });
  const update = requests.find(({ method }) => method === "PATCH");
  assert.deepEqual(update.body, {
    author_name: "真实昵称", title: "改过的标题", summary: "摘要", content: "## 原理\n正文", status: "published",
  });
  assert.equal(update.url.searchParams.get("author_id"), "eq.real-user-id");
  assert.equal(update.url.searchParams.get("id"), "eq.article-id");
  assert.equal(update.url.searchParams.get("select"), "id,slug");
  const tagInsert = requests.find(({ url, method }) => url.pathname.endsWith("/tags") && method === "POST");
  assert.deepEqual(tagInsert.body, [{ name: "ROS 2" }]);
  assert.match(tagInsert.headers.get("Prefer"), /resolution=ignore-duplicates/);
});

test("publishing derives the creator account and nickname from the session and ignores classification fields", async () => {
  const { requests, publishKnowledge } = knowledgeActions({ displayName: " " });
  await assert.rejects(publishKnowledge(knowledgeForm()), /redirect:\/knowledge/);
  const insert = requests.find(({ url, method }) => url.pathname.endsWith("/knowledge") && method === "POST");
  assert.equal(insert.body.author_id, "real-user-id");
  assert.equal(insert.body.author_name, "real");
  for (const field of ["difficulty", "created_at", "updated_at"]) {
    assert.equal(Object.hasOwn(insert.body, field), false);
  }
  assert.notEqual(insert.body.slug, "untrusted-submitted-slug");
});

test("tag deletion failures stop saving without silently replacing article tag relations", async () => {
  const { requests, saveKnowledgeUpdate } = knowledgeActions({ deleteError: true });
  await assert.rejects(saveKnowledgeUpdate(knowledgeForm()), /标签关联失败：permission denied/);
  assert.equal(requests.some(({ url }) => url.pathname.endsWith("/tags")), false);
});
