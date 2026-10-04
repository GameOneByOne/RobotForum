import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { publishResource } from "@/lib/platform/actions";

const resourceTypes = [
  { label: "工具", value: "tool" },
  { label: "GitHub 仓库", value: "github_repository" },
  { label: "论文", value: "paper" },
  { label: "书籍", value: "book" },
  { label: "数据集", value: "dataset" },
  { label: "硬件", value: "hardware" },
  { label: "课程", value: "course" },
  { label: "参考资料", value: "reference" },
];

export default async function NewResourcePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-8">
        <Link className="text-sm font-medium text-accent" href="/resources">
          返回资源目录
        </Link>
        <form
          action={publishResource}
          className="mt-5 space-y-5 rounded-xl border border-line bg-panel p-6"
        >
          <div>
            <p className="text-sm font-semibold text-accent">发布资源</p>
            <h1 className="mt-2 text-3xl font-bold">分享机器人开发资源</h1>
          </div>

          {!user && (
            <div className="rounded-md border border-line bg-raised p-3 text-sm text-muted">
              发布资源需要先登录。
              <Link className="ml-2 font-semibold text-accent" href="/login">
                去登录
              </Link>
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-semibold">资源名称</span>
            <input
              name="title"
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">资源链接</span>
            <input
              name="url"
              type="url"
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
              placeholder="https://..."
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">类型</span>
            <select
              name="type"
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            >
              {resourceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">介绍</span>
            <textarea
              name="description"
              required
              rows={5}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">标签</span>
            <input
              name="tags"
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
              placeholder="仿真, 论文, 传感器"
            />
          </label>

          <button
            type="submit"
            disabled={!user}
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-canvas transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-muted"
          >
            发布资源
          </button>
        </form>
      </section>
    </main>
  );
}
