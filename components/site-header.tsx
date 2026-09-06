import Link from "next/link";

import { AuthLinks } from "@/components/auth-links";
import { VisitorStatsPanel } from "@/components/visitor-stats-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { globalNavigation } from "@/lib/platform-data";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-[#d8dee6] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-[80vw] max-w-none flex-wrap items-center gap-4 px-5 py-3">
        <Link href="/" className="mr-2">
          <p className="text-sm font-semibold uppercase text-[#24706f]">
            Robot Knowledge Platform
          </p>
          <p className="text-base font-bold">机器人开发者知识论坛</p>
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

        <div className="flex items-center gap-3">
          <VisitorStatsPanel />

          <Link
            href="/search"
            className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm font-medium text-[#3f4754] hover:bg-[#f0f3f6]"
          >
            搜索
          </Link>

          <AuthLinks user={user} />
        </div>
      </div>
    </header>
  );
}
