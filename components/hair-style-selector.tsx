"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { HAIR_CATEGORIES } from "@/types";

interface HairStyleSelectorProps {
  onGenerate: (hairstyle: string, name: string, tags: string[]) => void;
  generating: boolean;
  disabled: boolean;
}

export default function HairStyleSelector({
  onGenerate,
  generating,
  disabled,
}: HairStyleSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("short");
  const [selectedStyle, setSelectedStyle] = useState<string>("");

  // Determine selected category's styles
  const allOptions = HAIR_CATEGORIES.flatMap((c) => c.options);

  const handleGenerate = (option: (typeof allOptions)[0]) => {
    setSelectedStyle(option.id);
    onGenerate(option.name, option.name, [option.name]);
  };

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-surface-700">选择发型</h3>
      </div>

      <div className="space-y-2">
        {HAIR_CATEGORIES.map((category) => (
          <div key={category.name}>
            <p className="mb-1.5 text-xs text-surface-400">{category.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {category.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleGenerate(option)}
                  disabled={disabled || generating}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                    ${selectedStyle === option.id
                      ? "bg-primary-500 text-white"
                      : "bg-surface-100 text-surface-600 hover:bg-surface-200"}
                    ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
