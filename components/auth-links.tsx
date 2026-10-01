import Link from "next/link";

import { UserAccountMenu } from "@/components/user-account-menu";
import type { AuthUser } from "@/lib/auth/session";

type AuthLinksProps = {
  user: AuthUser | null;
};

export function AuthLinks({ user }: AuthLinksProps) {
  if (user) {
    return <UserAccountMenu key={user.id} user={user} />;
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
