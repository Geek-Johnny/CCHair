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
      className="flex items-center gap-1 border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:border-primary-300/50 hover:bg-primary-500/10 hover:text-primary-100"
      title={lang === "zh" ? "Switch to English" : "切换到中文"}
    >
      <Globe className="h-3.5 w-3.5" />
      {LANGUAGES[lang].nativeLabel}
    </button>
  );
}
