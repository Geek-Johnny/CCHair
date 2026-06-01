import { NextRequest, NextResponse } from "next/server";
import { getSessionId, setSessionCookie } from "@/lib/session";
import { checkQuota, consumeQuota } from "@/lib/store";

const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_BASE_URL = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";

export async function POST(request: NextRequest) {
  try {
    const { image, hairstyle } = await request.json();

    if (!image || !hairstyle) {
      return NextResponse.json({ error: "请提供图片和发型描述" }, { status: 400 });
    }

    if (!ARK_API_KEY) {
      return NextResponse.json({ error: "API 密钥未配置" }, { status: 500 });
    }

    // Quota check
    const sessionId = await getSessionId();
    const quota = await checkQuota(sessionId);
    if (!quota.available) {
      const response = NextResponse.json(
        { error: "今日免费额度已用完，请升级获取更多次数", code: "QUOTA_EXCEEDED" },
        { status: 403 }
      );
      response.headers.set("Set-Cookie", setSessionCookie(sessionId));
      return response;
    }

    const prompt = `将图中人物的发型换成${hairstyle}，保持五官、脸型和肤色完全不变，可以略微美化一下脸上的瑕疵，正面照，高质量，写实风格`;

    const response = await fetch(`${ARK_BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "doubao-seedream-5-0-260128",
        prompt,
        image: [`data:image/jpeg;base64,${image}`],
        sequential_image_generation: "disabled",
        size: "1920x1920",
        n: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Seedream API 错误: ${data.error?.message || response.statusText}` },
        { status: response.status }
      );
    }

    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: "生成结果为空" }, { status: 500 });
    }

    // 下载生成的图片并转为 base64（避免 URL 过期）
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    // Consume quota after successful generation
    const remaining = await consumeQuota(sessionId);

    const apiResponse = NextResponse.json({
      image: imageBase64,
      remaining: remaining.totalRemaining,
    });
    apiResponse.headers.set("Set-Cookie", setSessionCookie(sessionId));
    return apiResponse;
  } catch (error) {
    console.error("发型生成失败:", error);
    const statusCode = error instanceof Error && error.message === "QUOTA_EXCEEDED" ? 403 : 500;
    const code = error instanceof Error && error.message === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : undefined;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成失败", code },
      { status: statusCode }
    );
  }
}
