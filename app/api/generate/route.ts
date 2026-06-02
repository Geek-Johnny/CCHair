import { NextRequest, NextResponse } from "next/server";
import { checkQuota, consumeQuota } from "@/lib/store";

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_BASE_URL = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const ADMIN_FINGERPRINT = process.env.ADMIN_FINGERPRINT;

export async function POST(request: NextRequest) {
  try {
    const { image, hairstyle, fingerprint } = await request.json();

    if (!image || !hairstyle) {
      return NextResponse.json({ error: "请提供图片和发型描述" }, { status: 400 });
    }

    if (!fingerprint) {
      return NextResponse.json({ error: "用户标识缺失" }, { status: 400 });
    }

    if (!ARK_API_KEY) {
      return NextResponse.json({ error: "API 密钥未配置" }, { status: 500 });
    }

    // Quota check using fingerprint (admin bypass)
    const isAdmin = ADMIN_FINGERPRINT && fingerprint === ADMIN_FINGERPRINT;
    if (!isAdmin) {
      const quota = await checkQuota(fingerprint);
      if (!quota.available) {
        return NextResponse.json(
          { error: "免费额度已用完，请升级获取更多次数", code: "QUOTA_EXCEEDED" },
          { status: 403 }
        );
      }
    }

    const prompt = `将图中人物的发型换成${hairstyle}，保持五官、脸型和肤色完全不变，可以略微美化一下脸上的瑕疵，正面照，高质量，写实风格`;

    const url = `${ARK_BASE_URL}/images/generations`;
    console.log("Seedream API 调用:", url, "model: doubao-seedream-5-0-260128");

    const response = await fetchWithRetry(url, {
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
    const imageResponse = await fetchWithRetry(imageUrl, {});
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    // Consume quota after successful generation (admin skip)
    const remaining = isAdmin
      ? { totalRemaining: Infinity }
      : await consumeQuota(fingerprint);

    return NextResponse.json({
      image: imageBase64,
      remaining: remaining.totalRemaining,
    });
  } catch (error) {
    console.error("发型生成失败:", error);
    console.error("ARK_BASE_URL:", ARK_BASE_URL);
    console.error("ARK_API_KEY exists:", !!ARK_API_KEY);
    const statusCode = error instanceof Error && error.message === "QUOTA_EXCEEDED" ? 403 : 500;
    const code = error instanceof Error && error.message === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : undefined;
    const errMsg = error instanceof Error ? `${error.name}: ${error.message}` : "生成失败";
    return NextResponse.json(
      { error: errMsg, code },
      { status: statusCode }
    );
  }
}
