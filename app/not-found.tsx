import Link from "next/link";
import { TechIcon } from "@/components/tech-icon";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <div className="mb-8 text-accent">
        <TechIcon kind="nodes" />
      </div>
      <p className="eyebrow">404 · SIGNAL NOT FOUND</p>
      <h1 className="mt-5 text-3xl font-semibold">暂时找不到这页内容</h1>
      <p className="mt-4 text-sm leading-7 text-secondary">
        内容可能已移动、删除，或暂未开放。你可以回到知识库继续探索。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/knowledge" className="primary-link">
          浏览知识库 →
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-line px-5 py-3 text-sm text-secondary"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
