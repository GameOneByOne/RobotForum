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
      <rect width="40" height="40" rx="20" fill="#eff6ff" />
      <path d="M20 9v5M11 23H8m24 0h-3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="9" r="2" fill="#60a5fa" />
      <rect x="11" y="14" width="18" height="17" rx="6" stroke="#2563eb" strokeWidth="2" />
      <circle cx="16" cy="21" r="2" fill="#2563eb" />
      <circle cx="24" cy="21" r="2" fill="#2563eb" />
      <path d="M17 27h6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
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
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dbeafe] bg-[#eff6ff] transition-shadow duration-200 hover:border-blue-400 hover:shadow-[0_0_0_3px_#dbeafe,0_0_16px_4px_#60a5fa80] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 motion-reduce:transition-none ${open ? "shadow-[0_0_0_3px_#dbeafe,0_0_16px_4px_#60a5fa80]" : ""}`}
      >
        <Avatar url={user.avatarUrl ?? null} name={name} />
      </button>

      {open && (
        <section
          id={panelId}
          aria-labelledby={titleId}
          className="absolute right-0 top-full z-30 mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_12px_40px_#0f172a1f]"
        >
          <p className="text-xs font-medium text-[#667085]">我的账号</p>
          <h2 id={titleId} className="mt-1 break-words text-base font-semibold text-[#18191f]">
            {name}
          </h2>
          <dl className="mt-4 text-sm">
            <div className="border-b border-[#eef2f6] pb-4">
              <dt className="text-xs text-[#667085]">账号</dt>
              <dd className="mt-1 break-all text-[#3f4754]">{user.email}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3 py-4">
              <div className="rounded-xl bg-[#eff6ff] p-3">
                <dt className="text-xs text-[#667085]">等级</dt>
                <dd className="mt-1 font-semibold text-[#2563eb]">
                  {user.level == null ? "暂未开通" : `Lv.${user.level}`}
                </dd>
              </div>
              <div className="rounded-xl bg-[#f8fafc] p-3">
                <dt className="text-xs text-[#667085]">积分</dt>
                <dd className="mt-1 font-semibold text-[#3f4754]">
                  {user.points == null ? "暂未开通" : user.points.toLocaleString("zh-CN")}
                </dd>
              </div>
            </div>
          </dl>
          <form action={signOut} className="border-t border-[#eef2f6] pt-3">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#667085] hover:bg-[#f0f3f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              退出登录
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
