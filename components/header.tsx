"use client";

import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-surface-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Sparkles className="h-5 w-5 text-primary-500" />
        <span className="text-lg font-semibold text-surface-900">
          CCHair
        </span>
        <span className="text-sm text-surface-500">AI 发型设计参考</span>
      </div>
    </header>
  );
}
