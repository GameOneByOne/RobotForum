import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
function loadSource(path, mocks = {}) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', code)(name => mocks[name] ?? require(name), loaded.exports, loaded);
  return loaded.exports;
}
const analytics = loadSource('../lib/analytics/visitors.ts');

// Simulates the existing table's primary key while exercising actual Supabase
// request construction, filters, count headers and upsert conflict options.
function database() {
  const rows = new Map();
  const requests = [];
  const client = createClient('https://example.supabase.co', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (url, options = {}) => {
      const request = new URL(url); requests.push({ request, options });
      assert.equal(request.pathname, '/rest/v1/visitor_sessions');
      if (options.method === 'POST') {
        assert.equal(request.searchParams.get('on_conflict'), 'visitor_id');
        assert.ok(options.headers.get('Prefer').includes('resolution=merge-duplicates'));
        for (const row of JSON.parse(options.body)) rows.set(row.visitor_id, row);
        return new Response(null, { status: 201 });
      }
      const prefix = request.searchParams.get('visitor_id').replace(/^like\./, '').replace(/%$/, '');
      const since = request.searchParams.get('last_seen_at')?.replace(/^gte\./, '');
      const count = [...rows.values()].filter(row => row.visitor_id.startsWith(prefix) && (!since || row.last_seen_at >= since)).length;
      return new Response(null, { status: 200, headers: { 'Content-Range': `*/${count}` } });
    } },
  });
  return { client, rows, requests };
}

test('Beijing date switches at midnight, including month and year boundaries', () => {
  for (const [before, after, oldDay, newDay] of [
    ['2026-10-11T15:59:59.999Z', '2026-10-11T16:00:00.000Z', '2026-10-11', '2026-10-12'],
    ['2026-12-31T15:59:59.999Z', '2026-12-31T16:00:00.000Z', '2026-12-31', '2027-01-01'],
  ]) {
    assert.equal(analytics.visitorDay(new Date(before)), oldDay);
    assert.equal(analytics.visitorDay(new Date(after)), newDay);
  }
});

test('trusted IP is canonicalized and client browser identity is irrelevant', () => {
  const h = new Headers({ 'x-vercel-forwarded-for': '2001:0DB8:0:0:0:0:0:1', 'x-forwarded-for': '192.0.2.99' });
  assert.equal(analytics.clientIp(h), '2001:db8::1');
  assert.equal(analytics.clientIp(new Headers({ 'x-forwarded-for': '::ffff:192.0.2.1' })), '192.0.2.1');
  assert.equal(analytics.clientIp(new Headers({ 'x-forwarded-for': '192.0.2.1, 10.0.0.1' })), '192.0.2.1');
  assert.equal(analytics.clientIp(new Headers()), null);
  assert.equal(analytics.clientIp(new Headers({ 'x-forwarded-for': 'not-an-ip' })), null);
});

test('same IP across paths and concurrent requests counts once; different IP counts separately', async () => {
  const { client, rows } = database();
  const now = new Date('2026-10-11T02:00:00Z');
  // Existing browser-ID records from the old version must not inflate counts.
  rows.set('old-browser-id', { visitor_id: 'old-browser-id', last_seen_at: now.toISOString() });
  await Promise.all(Array.from({ length: 20 }, (_, i) => analytics.recordVisitor(client, '192.0.2.1', `/page-${i}`, now)));
  let stats = await analytics.readVisitorStats(client, now);
  assert.equal(stats.visitsToday, 1); assert.equal(stats.onlineVisitors, 1);
  await analytics.recordVisitor(client, '192.0.2.2', '/', now);
  stats = await analytics.readVisitorStats(client, now);
  assert.equal(stats.visitsToday, 2); assert.equal(stats.onlineVisitors, 2);
  assert.ok([...rows.keys()].every(key => !key.includes('192.0.2.')));
  stats = await analytics.readVisitorStats(client, new Date(now.getTime() + 6 * 60 * 1000));
  assert.equal(stats.visitsToday, 2); assert.equal(stats.onlineVisitors, 0);
});

test('midnight returns zero without deleting history and heartbeat counts next day once', async () => {
  const { client } = database();
  const before = new Date('2026-10-11T15:59:59Z');
  const after = new Date('2026-10-11T16:00:00Z');
  await analytics.recordVisitor(client, '192.0.2.1', '/', before);
  assert.equal((await analytics.readVisitorStats(client, before)).visitsToday, 1);
  let stats = await analytics.readVisitorStats(client, after);
  assert.equal(stats.visitsToday, 0); assert.equal(stats.onlineVisitors, 1);
  await analytics.recordVisitor(client, '192.0.2.1', '/still-open', after);
  await analytics.recordVisitor(client, '192.0.2.1', '/new-page', after);
  stats = await analytics.readVisitorStats(client, after);
  assert.equal(stats.visitsToday, 1); assert.equal(stats.visits24h, 1);
  assert.equal(stats.statisticsDate, '2026-10-12');
  assert.equal((await analytics.readVisitorStats(client, before)).visitsToday, 1);
});

test('API ignores spoofed JSON identity, handles legacy heartbeats and disables response caching', async () => {
  const { client } = database();
  const route = loadSource('../app/api/visitors/route.ts', {
    '@/lib/analytics/visitors': analytics,
    '@/lib/supabase/env': { hasSupabaseEnv: () => true },
    '@/lib/supabase/public': { createPublicClient: () => client },
  });
  for (const [event, path, visitorId] of [['visit', '/', 'browser-one'], ['visit', '/knowledge', 'browser-two'], ['heartbeat', '/projects', 'browser-three']]) {
    const response = await route.POST(new Request('https://example.com/api/visitors', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-vercel-forwarded-for': '192.0.2.3' },
      body: JSON.stringify({ event, path, visitorId, ip: '192.0.2.4' }),
    }));
    assert.equal(response.status, 200); assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal((await response.json()).visitsToday, 1);
  }
  assert.equal((await (await route.GET()).json()).visitsToday, 1);
  const missingIp = await route.POST(new Request('https://example.com/api/visitors', { method: 'POST', body: '{}' }));
  assert.equal(missingIp.status, 400);
});
