import { NextRequest, NextResponse } from "next/server";

const ARK_API_KEY = process.env.ARK_API_KEY_ANALYZE || process.env.ARK_API_KEY;
const ARK_BASE_URL = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "请提供图片" }, { status: 400 });
    }

    if (!ARK_API_KEY) {
      return NextResponse.json({ error: "API 密钥未配置" }, { status: 500 });
    }

    const response = await fetch(`${ARK_BASE_URL}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "doubao-seed-2-0-mini-260428",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_image",
                image_url: `data:image/jpeg;base64,${image}`,
              },
              {
                type: "input_text",
                text: `请分析这张人像照片，严格按照以下 JSON 格式返回（不要包含其他文字）：

{
  "faceShape": "脸型（圆脸/方脸/瓜子脸/长脸/心形脸/椭圆脸）",
  "skinTone": "肤色（冷白皮/暖白皮/自然色/小麦色/古铜色）",
  "gender": "性别",
  "ageRange": "年龄段（如 20-25、26-30、31-35）",
  "features": {
    "eyes": "眼型描述",
    "eyebrows": "眉型描述",
    "nose": "鼻型描述",
    "lips": "唇型描述"
  },
  "currentHair": {
    "length": "当前发长描述",
    "color": "当前发色描述",
    "style": "当前发型风格描述"
  },
  "recommendedStyles": ["推荐的发型1", "推荐的发型2", "推荐的发型3"]
}`,
              },
            ],
          },
        ],
        max_output_tokens: 2048,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `火山方舟 API 错误: ${data.error?.message || response.statusText}` },
        { status: response.status }
      );
    }

    // Responses API 返回格式：output 数组包含 assistant 消息
    const content =
      data.output
        ?.find((item: any) => item.role === "assistant")
        ?.content?.find((c: any) => c.type === "output_text")?.text || "";

    const analysis = JSON.parse(content.replace(/```json|```/g, "").trim());

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("人脸分析失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "分析失败" },
      { status: 500 }
    );
  }
}
