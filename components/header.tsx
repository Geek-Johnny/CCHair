"use client";

import { useState } from "react";
import { History, Scissors } from "lucide-react";
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
      <header className="sticky top-0 z-30 border-b border-white/10 bg-surface-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <div className="flex h-9 w-9 items-center justify-center border border-primary-300/70 bg-primary-500/10 text-primary-200 shadow-[0_0_22px_rgba(185,129,40,0.18)]">
            <Scissors className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="text-lg font-bold tracking-wide text-surface-50">
              CCHair
            </span>
            <span className="hidden text-xs uppercase tracking-[0.22em] text-surface-300 sm:inline">
              {t("header.subtitle")}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <QuotaBar onUpgrade={() => setShowPlans(true)} refreshKey={quotaRefreshKey} />
            <button
              onClick={onHistoryClick}
              className="flex items-center gap-1.5 border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:border-primary-300/50 hover:bg-primary-500/10 hover:text-primary-100"
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
