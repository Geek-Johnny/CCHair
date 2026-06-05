"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/hook";
import { LANGUAGES, type Lang } from "@/lib/i18n/config";

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  const toggle = () => {
    setLang(lang === "zh" ? "en" : "zh");
  };

  return (
    <button
      onClick={toggle}
      className="flex shrink-0 items-center gap-1 whitespace-nowrap border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:border-primary-300/50 hover:bg-primary-500/10 hover:text-primary-100 sm:px-2.5"
      title={lang === "zh" ? "Switch to English" : "切换到中文"}
    >
      <Globe className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{LANGUAGES[lang].nativeLabel}</span>
    </button>
  );
}
