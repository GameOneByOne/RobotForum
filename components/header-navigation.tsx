"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { globalNavigation } from "@/lib/platform-data";

export function HeaderNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="主导航" className="flex flex-wrap items-center gap-1">
      {globalNavigation.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href) ||
              (item.href === "/discuss" && pathname.startsWith("/posts"));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-lg px-3 py-3 text-sm transition-colors ${active ? "text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-accent" : "text-secondary hover:bg-raised hover:text-ink"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
