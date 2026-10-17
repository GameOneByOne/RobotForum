"use server";

import { cookies } from "next/headers";
import { resolveLocale } from "@/lib/i18n/messages";

export async function setLocale(value: string) {
  (await cookies()).set("talovryn-locale", resolveLocale(value), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}
