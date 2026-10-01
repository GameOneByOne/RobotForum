"use client";

import { useEffect, useId, useRef, useState } from "react";

import { signOut } from "@/lib/auth/actions";
import type { AuthUser } from "@/lib/auth/session";

function Avatar({ url, name }: { url: string | null; name: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (url && failedUrl !== url) {
    return (
      // User avatars may be hosted on any provider; native images avoid a host allowlist.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`${name}的头像`}
        width={40}
        height={40}
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(url)}
        className="h-full w-full rounded-full object-cover"
      />
    );
  }

  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="h-full w-full">
      <rect width="40" height="40" rx="20" fill="#153542" />
      <path d="M20 9v5M11 23H8m24 0h-3" stroke="#59d9f2" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="9" r="2" fill="#8de8ff" />
      <rect x="11" y="14" width="18" height="17" rx="6" stroke="#59d9f2" strokeWidth="2" />
      <circle cx="16" cy="21" r="2" fill="#59d9f2" />
      <circle cx="24" cy="21" r="2" fill="#59d9f2" />
      <path d="M17 27h6" stroke="#59d9f2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function UserAccountMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();
  const name = user.displayName || user.email.split("@")[0] || "注册用户";

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={`${open ? "收起" : "查看"}${name}的账号信息`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-dim bg-accent-dim transition-shadow duration-200 hover:border-accent hover:shadow-[0_0_0_3px_#153542,0_0_16px_4px_#8de8ff80] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 motion-reduce:transition-none ${open ? "shadow-[0_0_0_3px_#153542,0_0_16px_4px_#8de8ff80]" : ""}`}
      >
        <Avatar url={user.avatarUrl ?? null} name={name} />
      </button>

      {open && (
        <section
          id={panelId}
          aria-labelledby={titleId}
          className="absolute right-0 top-full z-30 mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-panel p-5 shadow-[0_12px_40px_#0f172a1f]"
        >
          <p className="text-xs font-medium text-muted">我的账号</p>
          <h2 id={titleId} className="mt-1 break-words text-base font-semibold text-ink">
            {name}
          </h2>
          <dl className="mt-4 text-sm">
            <div className="border-b border-raised pb-4">
              <dt className="text-xs text-muted">账号</dt>
              <dd className="mt-1 break-all text-secondary">{user.email}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3 py-4">
              <div className="rounded-xl bg-accent-dim p-3">
                <dt className="text-xs text-muted">等级</dt>
                <dd className="mt-1 font-semibold text-accent">
                  {user.level == null ? "暂未开通" : `Lv.${user.level}`}
                </dd>
              </div>
              <div className="rounded-xl bg-raised p-3">
                <dt className="text-xs text-muted">积分</dt>
                <dd className="mt-1 font-semibold text-secondary">
                  {user.points == null ? "暂未开通" : user.points.toLocaleString("zh-CN")}
                </dd>
              </div>
            </div>
          </dl>
          <form action={signOut} className="border-t border-raised pt-3">
            <button
              type="submit"
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-muted hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              退出登录
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
