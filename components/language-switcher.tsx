"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/components/language-provider";
import { setLocale } from "@/lib/i18n/actions";

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const next = locale === "zh" ? "en" : "zh";
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        lang={next === "zh" ? "zh-CN" : "en"}
        aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
        aria-busy={pending}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setFailed(false);
            try {
              await setLocale(next);
            } catch {
              setFailed(true);
            }
          })
        }
        className="min-h-10 rounded-lg border border-line px-3 py-2 text-sm font-medium text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {locale === "zh" ? "EN" : "中文"}
      </button>
      {failed && (
        <p
          role="alert"
          className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-line bg-panel p-3 text-xs text-danger"
        >
          {t("语言切换失败，请重试。")}
        </p>
      )}
    </div>
  );
}
