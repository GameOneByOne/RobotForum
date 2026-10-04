import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
function loadSource(path, mocks = {}) {
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
  new Function("require", "exports", "module", code)(
    (name) => mocks[name] ?? require(name),
    loaded.exports,
    loaded,
  );
  return loaded.exports;
}
const helpers = loadSource("../lib/search.ts");
const id = "11111111-1111-1111-1111-111111111111";

function mockedClient(responseFor) {
  const requests = [];
  const client = createClient(
    "https://example.supabase.co",
    "public-test-key",
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: async (url) => {
          const request = new URL(url);
          requests.push(request);
          const response = responseFor(request);
          return new Response(JSON.stringify(response.data ?? []), {
            status: response.status ?? 200,
            headers: { "Content-Type": "application/json" },
          });
        },
      },
    },
  );
  return {
    requests,
    mocks: {
      "@/lib/search": helpers,
      "@/lib/supabase/env": { hasSupabaseEnv: () => true },
      "@/lib/supabase/public": { createPublicClient: () => client },
      "@/app/forum-data": { navItems: ["全部帖子", "ROS2"] },
    },
  };
}

test("search normalizes blank input and bounds long queries", () => {
  assert.equal(helpers.normalizeSearchQuery("  ROS2  "), "ROS2");
  assert.equal(helpers.normalizeSearchQuery("  "), "");
  assert.equal(helpers.normalizeSearchQuery("a".repeat(200)).length, 120);
});

test("wildcards and PostgREST punctuation stay literal", () => {
  const input = 'ROS2%),status.eq.draft,("_\\';
  const filter = helpers.textSearchFilter(["title"], input);
  assert.equal(
    JSON.parse(filter.slice("title.ilike.".length)),
    helpers.searchPattern(input),
  );
  assert.ok(helpers.searchPattern(input).includes("\\%"));
  assert.ok(helpers.searchPattern(input).includes("\\_"));
  assert.equal(
    helpers.includeSearchIds("title.ilike.x", [id, id, "),status.eq.draft"]),
    `title.ilike.x,id.in.(${id})`,
  );
});

test("tag-only and knowledge-body matches survive search with published filters", async () => {
  const { requests, mocks } = mockedClient((url) => {
    if (url.pathname.endsWith("/knowledge_tags"))
      return { data: [{ knowledge_id: id, tags: { name: "特殊标签" } }] };
    if (url.pathname.endsWith("/knowledge"))
      return {
        data: [
          {
            id,
            slug: "body-match",
            title: "运动学",
            summary: "概述",
            type: "guide",
            difficulty: "beginner",
            knowledge_tags: [{ tags: { name: "特殊标签" } }],
          },
        ],
      };
    return { data: [] };
  });
  const { searchPlatformContent } = loadSource(
    "../lib/platform/queries.ts",
    mocks,
  );
  const result = await searchPlatformContent("特殊标签");
  assert.equal(result.knowledge[0].slug, "body-match");
  const request = requests.find((url) => url.pathname.endsWith("/knowledge"));
  assert.equal(request.searchParams.get("status"), "eq.published");
  assert.equal(request.searchParams.get("limit"), "20");
  assert.ok(request.searchParams.get("or").includes("content.ilike."));
  assert.ok(request.searchParams.get("or").includes(`id.in.(${id})`));
});

test("forum matches are deduplicated and exclude deleted posts before limits", async () => {
  const { requests, mocks } = mockedClient(() => ({
    data: [
      {
        slug: "ros2",
        title: "ROS2",
        tags: ["ROS2"],
        published_at: "2026-10-01T00:00:00Z",
      },
    ],
  }));
  const { searchForumPosts } = loadSource("../lib/forum/posts.ts", mocks);
  const result = await searchForumPosts("ROS2");
  assert.equal(result.length, 1);
  assert.equal(requests.length, 2);
  for (const request of requests) {
    assert.equal(request.searchParams.get("is_published"), "eq.true");
    assert.equal(
      request.searchParams.get("tags").includes("__deleted__") ||
        request.searchParams
          .getAll("tags")
          .some((x) => x.includes("__deleted__")),
      true,
    );
  }
});

test("database failures propagate instead of becoming false no-results", async () => {
  const { mocks } = mockedClient(() => ({
    status: 500,
    data: { message: "database unavailable" },
  }));
  const { searchPlatformContent } = loadSource(
    "../lib/platform/queries.ts",
    mocks,
  );
  await assert.rejects(searchPlatformContent("ROS2"));
  const { searchForumPosts } = loadSource("../lib/forum/posts.ts", mocks);
  await assert.rejects(searchForumPosts("ROS2"));
});
