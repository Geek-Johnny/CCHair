import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import LanguageInit from "@/components/language-init";

export const metadata: Metadata = {
  title: "HairMirra 发型魔镜 - AI 发型设计与试戴",
  description: "上传照片，让 AI 魔镜看见更适合你的美。",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <LanguageInit />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
