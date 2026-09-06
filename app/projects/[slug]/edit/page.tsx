import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { updateProject } from "@/lib/platform/actions";
import { getProjectBySlug } from "@/lib/platform/queries";

type EditProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = await params;
  const [project, user] = await Promise.all([
    getProjectBySlug(slug),
    getCurrentUser(),
  ]);

  if (!project || !user || project.ownerId !== user.id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <section className="mx-auto w-[80vw] max-w-3xl px-5 py-8">
        <Link className="text-sm font-medium text-[#24706f]" href="/projects">
          返回项目列表
        </Link>
        <form
          action={updateProject}
          className="mt-5 space-y-5 rounded-lg border border-[#d8dee6] bg-white p-6"
        >
          <input type="hidden" name="slug" value={project.slug} />
          <div>
            <p className="text-sm font-semibold text-[#24706f]">编辑项目</p>
            <h1 className="mt-2 text-3xl font-bold">{project.title}</h1>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">项目名称</span>
            <input
              name="title"
              defaultValue={project.title}
              required
              className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">项目介绍</span>
            <textarea
              name="description"
              defaultValue={project.description}
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
              defaultValue={project.githubUrl}
              className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-[#24706f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
          >
            更新项目
          </button>
        </form>
      </section>
    </main>
  );
}
