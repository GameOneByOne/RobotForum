import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
function load(path, mocks = {}) {
  const code = ts.transpileModule(
    readFileSync(new URL(path, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", code)(
    (name) => mocks[name] ?? require(name),
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}
const plan = load("../lib/projects/plan.ts");
const id = "aaaaaaaa-1111-2222-3333-444444444444";
const stage = {
  title: "启动",
  outcome: "看到小海龟",
  description: "",
  content: "```bash\nros2 run turtlesim turtlesim_node\n```",
  lessons: [
    { knowledgeId: id, kind: "required", title: "伪造标题", slug: "fake" },
  ],
};
function form() {
  const value = new FormData();
  for (const [key, text] of Object.entries({
    title: "测试项目",
    description: "项目简介",
    content: "# 操作\n\n保持正文",
    hardware: "电脑\n键盘\n电脑",
    tags: "ROS 2，仿真,ROS 2",
    stages: JSON.stringify([stage]),
  }))
    value.set(key, text);
  return value;
}

test("project form preserves Markdown and canonical article IDs, deduplicating requirements and tags", () => {
  const result = plan.parseProjectForm(form());
  assert.equal(result.content, "# 操作\n\n保持正文");
  assert.deepEqual(result.hardware, ["电脑", "键盘"]);
  assert.deepEqual(result.tags, ["ROS 2", "仿真"]);
  assert.equal(result.stages[0].content, stage.content);
  assert.deepEqual(result.stages[0].lessons, [
    { knowledgeId: id, kind: "required" },
  ]);
});

test("project validation rejects unsafe URLs, malformed or duplicate references and incomplete stages", () => {
  const input = form();
  input.set("githubUrl", "javascript:alert(1)");
  assert.throws(() => plan.parseProjectForm(input), /HTTP/);
  for (const lessons of [
    [{ knowledgeId: "invalid", kind: "required" }],
    [{ knowledgeId: id, kind: "unknown" }],
    [
      { knowledgeId: id, kind: "required" },
      { knowledgeId: id.toUpperCase(), kind: "optional" },
    ],
  ])
    assert.throws(() => plan.parseProjectStages([{ ...stage, lessons }]));
  assert.throws(() => plan.parseProjectStages([{ ...stage, outcome: " " }]));
  assert.throws(() => plan.parseProjectStages(Array(31).fill(stage)));
  assert.throws(() => plan.projectLines(Array(41).fill("电脑")));
});

test("saving submits the complete plan through one RPC and revalidates only after success", async () => {
  const calls = [],
    paths = [];
  const { saveProject } = load("../lib/projects/actions.ts", {
    "@/lib/projects/plan": plan,
    "@/lib/supabase/env": { hasSupabaseEnv: () => true },
    "@/lib/auth/session": {
      requireCurrentUser: async () => ({
        id,
        displayName: "Author",
        email: "test@example.com",
      }),
    },
    "@/lib/supabase/server": {
      createClient: async () => ({
        rpc: (name, payload) => {
          calls.push({ name, payload });
          return {
            single: async () => ({
              data: { project_id: id, project_slug: "saved-project" },
              error: null,
            }),
          };
        },
      }),
    },
    "next/cache": { revalidatePath: (path) => paths.push(path) },
    "next/navigation": {
      redirect: (path) => {
        throw new Error(`redirect:${path}`);
      },
    },
  });
  await assert.rejects(
    saveProject({ error: "" }, form()),
    /redirect:\/projects\/saved-project/,
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "save_project_plan");
  assert.equal(calls[0].payload.p_project_id, null);
  assert.equal(calls[0].payload.p_project.authorName, "Author");
  assert.equal(calls[0].payload.p_project.stages[0].lessons[0].knowledgeId, id);
  assert.deepEqual(paths, [
    "/",
    "/projects",
    "/projects/saved-project",
    "/search",
  ]);
  const invalid = form();
  invalid.set("projectId", "-".repeat(36));
  assert.match((await saveProject({ error: "" }, invalid)).error, /标识无效/);
  assert.equal(calls.length, 1);
});

test("project detail orders route stages and article links and excludes unavailable articles", async () => {
  const client = createClient(
    "https://example.supabase.co",
    "public-test-key",
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: async () =>
          new Response(
            JSON.stringify({
              id,
              slug: "sample",
              title: "Sample",
              project_learning_stages: [
                {
                  position: 1,
                  title: "第二步",
                  outcome: "完成",
                  project_stage_knowledge: [
                    {
                      position: 2,
                      knowledge_id: "c",
                      kind: "optional",
                      knowledge: null,
                    },
                    {
                      position: 1,
                      knowledge_id: "b",
                      kind: "supplement",
                      knowledge: { title: "B", slug: "b", status: "published" },
                    },
                    {
                      position: 0,
                      knowledge_id: "a",
                      kind: "required",
                      knowledge: { title: "A", slug: "a", status: "published" },
                    },
                    {
                      position: 3,
                      knowledge_id: "d",
                      kind: "optional",
                      knowledge: {
                        title: "Draft",
                        slug: "draft",
                        status: "draft",
                      },
                    },
                  ],
                },
                { position: 0, title: "第一步", outcome: "启动" },
              ],
            }),
            { headers: { "Content-Type": "application/json" } },
          ),
      },
    },
  );
  const { getProjectBySlug } = load("../lib/platform/queries.ts", {
    "@/lib/search": load("../lib/search.ts"),
    "@/lib/supabase/env": { hasSupabaseEnv: () => true },
    "@/lib/supabase/public": { createPublicClient: () => client },
  });
  const result = await getProjectBySlug("sample");
  assert.deepEqual(
    result.stages.map((entry) => entry.title),
    ["第一步", "第二步"],
  );
  assert.deepEqual(
    result.stages[1].lessons.map((entry) => entry.slug),
    ["a", "b"],
  );
  assert.deepEqual(result.hardware, []);
});
