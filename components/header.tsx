"use client";

import { useState } from "react";
import { Sparkles, History } from "lucide-react";
import QuotaBar from "@/components/quota-bar";
import PlanSelector from "@/components/plan-selector";
import LanguageSwitcher from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n/hook";

interface HeaderProps {
  onHistoryClick?: () => void;
  quotaRefreshKey?: number;
}

export default function Header({ onHistoryClick, quotaRefreshKey }: HeaderProps) {
  const { t } = useTranslation();
  const [showPlans, setShowPlans] = useState(false);

  return (
    <>
      {showPlans && <PlanSelector onClose={() => setShowPlans(false)} />}
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
          <Sparkles className="h-5 w-5 text-primary-500" />
          <span className="text-lg font-semibold text-surface-900">
            CCHair
          </span>
          <span className="text-sm text-surface-500">{t("header.subtitle")}</span>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <QuotaBar onUpgrade={() => setShowPlans(true)} refreshKey={quotaRefreshKey} />
            <button
              onClick={onHistoryClick}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
            >
              <History className="h-3.5 w-3.5" />
              {t("header.history")}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
