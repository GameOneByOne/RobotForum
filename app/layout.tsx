import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Robot Forum",
  description: "A community forum for robotics builders and developers.",
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
