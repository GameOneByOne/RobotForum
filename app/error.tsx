"use client";

import { useI18n } from "@/components/language-provider";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">{t("CONNECTION INTERRUPTED")}</p>
      <h1 className="mt-5 text-3xl font-semibold">{t("内容暂时无法加载")}</h1>
      <p className="mt-4 text-sm text-secondary">
        {t("请稍后重试，或返回其他页面继续浏览。")}
      </p>
      <button type="button" onClick={reset} className="primary-link mt-8">
        {t("重新加载")}
      </button>
    </main>
  );
}
