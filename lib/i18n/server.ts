import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { createTranslator, resolveLocale } from "@/lib/i18n/messages";

export const getLocale = cache(async () =>
  resolveLocale((await cookies()).get("talovryn-locale")?.value),
);

export async function getTranslator() {
  return createTranslator(await getLocale());
}
