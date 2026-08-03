import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Robot Developer Platform",
  description: "机器人开发者技术协作平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
