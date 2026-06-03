export type Lang = "zh" | "en";

export const LANGUAGES: Record<Lang, { label: string; nativeLabel: string }> = {
  zh: { label: "Chinese", nativeLabel: "中文" },
  en: { label: "English", nativeLabel: "EN" },
};

export const DEFAULT_LANG: Lang = "zh";
export const STORAGE_KEY = "cchair_lang";

export function detectLanguage(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "zh" || stored === "en") return stored;

  const langs = navigator.languages || [];
  for (const l of langs) {
    if (l.startsWith("zh")) return "zh";
    if (l.startsWith("en")) return "en";
  }

  return DEFAULT_LANG;
}
