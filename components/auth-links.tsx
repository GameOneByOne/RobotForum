import { UserAccountMenu } from "@/components/user-account-menu";
import type { AuthUser } from "@/lib/auth/session";

type AuthLinksProps = {
  user: AuthUser | null;
};

export function AuthLinks({ user }: AuthLinksProps) {
  return <UserAccountMenu key={user?.id ?? "guest"} user={user} />;
}
