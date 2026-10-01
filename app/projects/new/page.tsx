import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { publishProject } from "@/lib/platform/actions";

export default async function NewProjectPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-8">
        <Link className="text-sm font-medium text-accent" href="/projects">
          返回项目列表
        </Link>
        <form
          action={publishProject}
          className="mt-5 space-y-5 rounded-xl border border-line bg-panel p-6"
        >
          <div>
            <p className="text-sm font-semibold text-accent">发布项目</p>
            <h1 className="mt-2 text-3xl font-bold">分享你的机器人项目</h1>
          </div>

          {!user && (
            <div className="rounded-md border border-line bg-raised p-3 text-sm text-muted">
              发布项目需要先登录。
              <Link className="ml-2 font-semibold text-accent" href="/login">
                去登录
              </Link>
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-semibold">项目名称</span>
            <input
              name="title"
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">项目介绍</span>
            <textarea
              name="description"
              required
              rows={5}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">GitHub 链接</span>
            <input
              name="githubUrl"
              type="url"
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
              placeholder="https://github.com/..."
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">标签</span>
            <input
              name="tags"
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
              placeholder="ROS, 机械臂, SLAM"
            />
          </label>

          <button
            type="submit"
            disabled={!user}
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-canvas transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-muted"
          >
            发布项目
          </button>
        </form>
      </section>
    </main>
  );
}
