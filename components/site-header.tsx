import Link from "next/link";

import { globalNavigation } from "@/lib/platform-data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d8dee6] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-3">
        <Link href="/" className="mr-2">
          <p className="text-sm font-semibold uppercase text-[#24706f]">
            Robot Developer Platform
          </p>
          <p className="text-base font-bold">机器人开发者技术协作平台</p>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1 text-sm">
          {globalNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 font-medium text-[#3f4754] hover:bg-[#f0f3f6]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/search"
          className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm font-medium text-[#3f4754] hover:bg-[#f0f3f6]"
        >
          搜索
        </Link>
      </div>
    </header>
  );
}
