import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { publishProject } from "@/lib/platform/actions";

export default async function NewProjectPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <section className="mx-auto w-[80vw] max-w-3xl px-5 py-8">
        <Link className="text-sm font-medium text-[#24706f]" href="/projects">
          返回项目列表
        </Link>
        <form
          action={publishProject}
          className="mt-5 space-y-5 rounded-lg border border-[#d8dee6] bg-white p-6"
        >
          <div>
            <p className="text-sm font-semibold text-[#24706f]">发布项目</p>
            <h1 className="mt-2 text-3xl font-bold">分享你的机器人项目</h1>
          </div>

          {!user && (
            <div className="rounded-md border border-[#d8dee6] bg-[#f8fafc] p-3 text-sm text-[#667085]">
              发布项目需要先登录。
              <Link className="ml-2 font-semibold text-[#24706f]" href="/login">
                去登录
              </Link>
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-semibold">项目名称</span>
            <input
              name="title"
              required
              className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">项目介绍</span>
            <textarea
              name="description"
              required
              rows={5}
              className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">GitHub 链接</span>
            <input
              name="githubUrl"
              type="url"
              className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
              placeholder="https://github.com/..."
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">标签</span>
            <input
              name="tags"
              className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
              placeholder="ROS, 机械臂, SLAM"
            />
          </label>

          <button
            type="submit"
            disabled={!user}
            className="rounded-md bg-[#24706f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6867] disabled:cursor-not-allowed disabled:bg-[#98a2b3]"
          >
            发布项目
          </button>
        </form>
      </section>
    </main>
  );
}
