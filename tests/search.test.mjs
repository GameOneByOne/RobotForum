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

test("homepage knowledge and projects request latest modification before limiting", async () => {
  const { requests, mocks } = mockedClient(() => ({ data: [] }));
  const { getProjects, getKnowledgeItems } = loadSource("../lib/platform/queries.ts", mocks);
  await Promise.all([getProjects(3, "updated_at"), getKnowledgeItems(3, "updated_at")]);
  assert.equal(requests.length, 2);
  for (const request of requests) {
    assert.equal(request.searchParams.get("limit"), "3");
    assert.equal(request.searchParams.get("order"), "updated_at.desc,id.desc");
  }
  assert.equal(requests.find(r => r.pathname.endsWith('/knowledge')).searchParams.get('status'), 'eq.published');
  assert.equal(requests.find(r => r.pathname.endsWith('/projects')).searchParams.get('is_published'), 'eq.true');
});

test("latest activity requests 30 visible events and safely links content", async () => {
  let received;
  const rows = [
    { id: "event1", actor_name: "Maker", action: "commented", kind: "knowledge", title: "Linux", slug: "中文/#", occurred_at: "2026-10-18T02:00:00Z", comment_excerpt: "Why?" },
    { id: "event2", actor_name: " ", action: "created", kind: "discussion", title: "Robot", slug: "new-post", occurred_at: "2026-10-17T02:00:00Z", comment_excerpt: null },
  ];
  const mocks = {
    "@/lib/supabase/env": { hasSupabaseEnv: () => true },
    "@/lib/supabase/public": { createPublicClient: () => ({ rpc: async (name, args) => { received = { name, args }; return { data: rows, error: null }; } }) },
  };
  const { getLatestActivity } = loadSource("../lib/activity/queries.ts", mocks);
  const result = await getLatestActivity();
  assert.deepEqual(received, { name: "get_latest_activity", args: { p_limit: 30 } });
  assert.equal(result[0].href, "/knowledge/" + encodeURIComponent("中文/#"));
  assert.equal(result[0].excerpt, "Why?");
  assert.equal(result[1].actor, "游客");
  assert.equal(result[1].href, "/posts/new-post");
  assert.equal("excerpt" in result[1], false);
  mocks["@/lib/supabase/public"].createPublicClient = () => ({ rpc: async () => ({ error: { message: "offline" } }) });
  await assert.rejects(getLatestActivity(), /offline/);
});
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
            author_name: "  Robot Maker  ",
            created_at: "2026-10-01T00:00:00Z",
            updated_at: "2026-10-18T02:30:00Z",
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
  assert.equal(result.knowledge[0].author, "Robot Maker");
  assert.equal(result.knowledge[0].createdAt, "2026-10-01T00:00:00Z");
  assert.equal(result.knowledge[0].updatedAt, "2026-10-18T02:30:00Z");
  const request = requests.find((url) => url.pathname.endsWith("/knowledge"));
  assert.equal(request.searchParams.get("status"), "eq.published");
  assert.equal(request.searchParams.get("limit"), "20");
  assert.ok(request.searchParams.get("or").includes("content.ilike."));
  assert.ok(request.searchParams.get("or").includes("author_name.ilike."));
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
