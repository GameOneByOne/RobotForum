import "katex/dist/katex.min.css";
import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/components/language-provider";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: {
      default: locale === "zh" ? "塔洛维恩 · Talovryn" : "Talovryn",
      template: "%s | Talovryn",
    },
    description:
      locale === "zh"
        ? "塔洛维恩，机器人开发者社区。分享知识、项目与实践经验。"
        : "A community for robot builders. Share knowledge, projects and hands-on experience.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <body>
        <LanguageProvider locale={locale}>
          {children}
          <SiteFooter />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
