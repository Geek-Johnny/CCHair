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
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
      title={lang === "zh" ? "Switch to English" : "切换到中文"}
    >
      <Globe className="h-3.5 w-3.5" />
      {LANGUAGES[lang].nativeLabel}
    </button>
  );
}
