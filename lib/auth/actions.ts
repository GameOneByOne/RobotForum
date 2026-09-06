"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function authRedirect(message: string) {
  redirect(`/login?message=${encodeURIComponent(message)}`);
}

export async function signUpWithEmail(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    authRedirect("Supabase 环境变量未配置，暂时无法注册。");
  }

  const email = normalizeText(formData.get("email"));
  const password = normalizeText(formData.get("password"));

  if (!email || password.length < 6) {
    authRedirect("请输入邮箱，并设置至少 6 位密码。");
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    authRedirect(`注册失败：${error.message}`);
  }

  authRedirect("注册成功。请查看邮箱完成验证后登录。");
}

export async function signInWithEmail(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    authRedirect("Supabase 环境变量未配置，暂时无法登录。");
  }

  const email = normalizeText(formData.get("email"));
  const password = normalizeText(formData.get("password"));

  if (!email || !password) {
    authRedirect("请输入邮箱和密码。");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    authRedirect(`登录失败：${error.message}`);
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
