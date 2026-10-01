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
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-8">
        <Link className="text-sm font-medium text-accent" href="/projects">
          返回项目列表
        </Link>
        <form
          action={updateProject}
          className="mt-5 space-y-5 rounded-xl border border-line bg-panel p-6"
        >
          <input type="hidden" name="slug" value={project.slug} />
          <div>
            <p className="text-sm font-semibold text-accent">编辑项目</p>
            <h1 className="mt-2 text-3xl font-bold">{project.title}</h1>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">项目名称</span>
            <input
              name="title"
              defaultValue={project.title}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">项目介绍</span>
            <textarea
              name="description"
              defaultValue={project.description}
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
              defaultValue={project.githubUrl}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-canvas transition hover:bg-accent-strong"
          >
            更新项目
          </button>
        </form>
      </section>
    </main>
  );
}
