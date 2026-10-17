"use client";

import { useI18n } from "@/components/language-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { globalNavigation } from "@/lib/platform-data";

export function HeaderNavigation() {
  const { t } = useI18n();
  const pathname = usePathname();
  return (
    <nav
      aria-label={t("主导航")}
      className="grid w-full grid-cols-5 gap-1 sm:flex sm:w-auto sm:flex-wrap sm:items-center"
    >
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
            className={`relative rounded-lg px-1 py-3 text-center text-xs transition-colors sm:px-3 sm:text-sm ${active ? "text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-accent" : "text-secondary hover:bg-raised hover:text-ink"}`}
          >
            {t(item.label)}
          </Link>
        );
      })}
    </nav>
  );
}
