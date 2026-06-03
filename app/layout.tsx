import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import LanguageInit from "@/components/language-init";

export const metadata: Metadata = {
  title: "CCHair - AI 发型设计",
  description: "上传人像照，AI 分析脸型五官，一键生成多款发型效果图",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-surface-50 text-surface-900 antialiased">
        <LanguageInit />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
