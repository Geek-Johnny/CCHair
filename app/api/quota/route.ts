import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { checkQuota } from "@/lib/store";
import { setSessionCookie } from "@/lib/session";
import { FREE_CREDITS } from "@/types/plan";

export async function GET() {
  try {
    const sessionId = await getSessionId();
    const quota = await checkQuota(sessionId);

    const response = NextResponse.json({
      freeUsed: FREE_CREDITS - quota.freeRemaining,
      freeLimit: FREE_CREDITS,
      paidCredits: quota.paidCredits,
      totalRemaining: quota.totalRemaining,
    });

    // Set cookie if new session
    response.headers.set("Set-Cookie", setSessionCookie(sessionId));
    return response;
  } catch (error) {
    console.error("查询额度失败:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
