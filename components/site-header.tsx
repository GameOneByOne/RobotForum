import Link from "next/link";
import { AuthLinks } from "@/components/auth-links";
import { HeaderNavigation } from "@/components/header-navigation";
import { SearchForm } from "@/components/search-form";
import { TechIcon } from "@/components/tech-icon";
import type { AuthUser } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return <HeaderContent user={user} />;
}

export function HeaderContent({
  user,
  searchAction = "/search",
}: {
  user: AuthUser | null;
  searchAction?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-3 px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-accent">
            <TechIcon className="h-8 w-8" />
          </span>
          <span>
            <span className="block text-xs font-semibold tracking-[0.08em] text-ink sm:text-sm">
              ROBOT KNOWLEDGE PLATFORM
            </span>
            <span className="mt-1 block text-xs tracking-wider text-muted">
              机器人开发者知识论坛
            </span>
          </span>
        </Link>
        <HeaderNavigation />
        <div className="flex w-full items-center gap-4 lg:w-auto">
          <SearchForm compact action={searchAction} />
          <AuthLinks user={user} />
        </div>
      </div>
    </header>
  );
}
