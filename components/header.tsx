"use client";

import Image from "next/image";
import { useState } from "react";
import { History } from "lucide-react";
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
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo-hairmirra-gold.svg"
              alt="HairMirra"
              width={184}
              height={39}
              priority
              className="h-9 w-32 shrink-0 object-contain object-left sm:w-[11.5rem]"
            />
            <span className="hidden text-xs uppercase tracking-[0.22em] text-surface-300 lg:inline">
              {t("header.subtitle")}
            </span>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <QuotaBar
              onUpgrade={() => setShowPlans(true)}
              refreshKey={quotaRefreshKey}
            />
            <LanguageSwitcher />
            <button
              onClick={onHistoryClick}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:border-primary-300/50 hover:bg-primary-500/10 hover:text-primary-100 sm:px-3"
              title={t("header.history")}
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("header.history")}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
