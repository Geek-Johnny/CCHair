import { NextRequest, NextResponse } from "next/server";
import { checkQuota } from "@/lib/store";
import { FREE_CREDITS } from "@/types/plan";

export async function POST(request: NextRequest) {
  try {
    const { fingerprint } = await request.json();

    if (!fingerprint) {
      return NextResponse.json({ error: "用户标识缺失" }, { status: 400 });
    }

    const quota = await checkQuota(fingerprint);

    return NextResponse.json({
      freeUsed: FREE_CREDITS - quota.freeRemaining,
      freeLimit: FREE_CREDITS,
      freeRemaining: quota.freeRemaining,
      paidCredits: quota.paidCredits,
      totalRemaining: quota.totalRemaining,
    });
  } catch (error) {
    console.error("查询额度失败:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
