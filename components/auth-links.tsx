import Link from "next/link";

import { signOut } from "@/lib/auth/actions";
import type { AuthUser } from "@/lib/auth/session";

type AuthLinksProps = {
  user: AuthUser | null;
};

export function AuthLinks({ user }: AuthLinksProps) {
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="max-w-36 truncate text-xs font-medium text-[#667085]">
          {user.email}
        </span>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm font-medium text-[#3f4754] hover:bg-[#f0f3f6]"
          >
            退出
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm font-medium text-[#3f4754] hover:bg-[#f0f3f6]"
      >
        登录
      </Link>
      <Link
        href="/login?mode=register"
        className="rounded-md bg-[#24706f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1f6867]"
      >
        注册
      </Link>
    </div>
  );
}
