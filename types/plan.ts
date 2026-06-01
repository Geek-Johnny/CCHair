export const PLANS = {
  go: { name: "GO level", credits: 5, price: 490, originalPrice: 1000, description: "体验包" },
  plus: { name: "Plus level", credits: 15, price: 990, originalPrice: 2000, description: "常用包" },
  pro: { name: "Pro level", credits: 30, price: 1490, originalPrice: 3000, description: "畅享包" },
} as const;

export type PlanKey = keyof typeof PLANS;

export const FREE_CREDITS = 3;
