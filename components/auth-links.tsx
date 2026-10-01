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
        className="rounded-md border border-line px-3 py-2 text-sm font-medium text-secondary hover:bg-raised"
      >
        登录
      </Link>
      <Link
        href="/login?mode=register"
        className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-canvas hover:bg-accent-strong"
      >
        注册
      </Link>
    </div>
  );
}
