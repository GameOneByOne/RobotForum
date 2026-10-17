"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTranslator, type Locale } from "@/lib/i18n/messages";

const LanguageContext = createContext<Locale>("zh");

export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LanguageContext.Provider value={locale}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const locale = useContext(LanguageContext);
  const t = useMemo(() => createTranslator(locale), [locale]);
  return { locale, t };
}
