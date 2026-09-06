import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams?: Promise<{
    message?: string;
    mode?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const isRegisterMode = params?.mode === "register";
  const message = params?.message;

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <section className="mx-auto w-[80vw] max-w-xl px-5 py-10">
        <div className="rounded-lg border border-[#d8dee6] bg-white p-6">
          <p className="text-sm font-semibold text-[#24706f]">
            {isRegisterMode ? "注册账号" : "邮箱登录"}
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            {isRegisterMode ? "创建论坛账号" : "登录机器人开发者知识论坛"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#5b6472]">
            游客可以浏览内容；登录后可以发布内容，并管理自己发布的帖子、项目、知识库和资源。
          </p>

          {message && (
            <div className="mt-5 rounded-md border border-[#b7cfcd] bg-[#f4fbfa] p-3 text-sm text-[#24706f]">
              {message}
            </div>
          )}

          <form
            action={isRegisterMode ? signUpWithEmail : signInWithEmail}
            className="mt-6 space-y-4"
          >
            <label className="block space-y-2">
              <span className="text-sm font-semibold">邮箱</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold">密码</span>
              <input
                name="password"
                type="password"
                autoComplete={isRegisterMode ? "new-password" : "current-password"}
                minLength={6}
                required
                className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
                placeholder="至少 6 位"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-md bg-[#24706f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6867]"
            >
              {isRegisterMode ? "注册" : "登录"}
            </button>
          </form>

          <div className="mt-5 text-sm text-[#667085]">
            {isRegisterMode ? (
              <Link className="font-semibold text-[#24706f]" href="/login">
                已有账号？去登录
              </Link>
            ) : (
              <Link
                className="font-semibold text-[#24706f]"
                href="/login?mode=register"
              >
                没有账号？去注册
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
