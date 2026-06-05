"use client";

import { useEffect } from "react";
import { detectLanguage } from "@/lib/i18n/config";

export default function LanguageInit() {
  useEffect(() => {
    const lang = detectLanguage();
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    if (lang === "en") {
      document.title = "HairMirra - AI Hairstyle Design";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          "Upload a photo and let the AI mirror reveal a look that suits you."
        );
      }
    }
  }, []);

  return null;
}
