import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { updateResource } from "@/lib/platform/actions";
import { getResourceBySlug } from "@/lib/platform/queries";

type EditResourcePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

const resourceTypeValueMap = {
  Book: "book",
  Course: "course",
  Dataset: "dataset",
  "Github Repository": "github_repository",
  Hardware: "hardware",
  Paper: "paper",
  Reference: "reference",
  Tool: "tool",
} as const;

export const dynamic = "force-dynamic";

export default async function EditResourcePage({
  params,
}: EditResourcePageProps) {
  const { slug } = await params;
  const [resource, user] = await Promise.all([
    getResourceBySlug(slug),
    getCurrentUser(),
  ]);

  if (!resource || !user || resource.creatorId !== user.id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-8">
        <Link className="text-sm font-medium text-accent" href="/resources">
          返回资源目录
        </Link>
        <form
          action={updateResource}
          className="mt-5 space-y-5 rounded-xl border border-line bg-panel p-6"
        >
          <input type="hidden" name="slug" value={resource.slug} />
          <div>
            <p className="text-sm font-semibold text-accent">编辑资源</p>
            <h1 className="mt-2 text-3xl font-bold">{resource.title}</h1>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">资源名称</span>
            <input
              name="title"
              defaultValue={resource.title}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">资源链接</span>
            <input
              name="url"
              type="url"
              defaultValue={resource.url}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">类型</span>
            <select
              name="type"
              defaultValue={resourceTypeValueMap[resource.type]}
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
              defaultValue={resource.description}
              required
              rows={5}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-canvas transition hover:bg-accent-strong"
          >
            更新资源
          </button>
        </form>
      </section>
    </main>
  );
}
