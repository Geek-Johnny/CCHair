import { NextRequest, NextResponse } from "next/server";

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

// 火山方舟 (Doubao-seed-2.0-mini)
const ARK_API_KEY = process.env.ARK_API_KEY_ANALYZE || process.env.ARK_API_KEY;
const ARK_BASE_URL = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";

// DMXAPI (Mimo-V2.5)
const DMXAPI_KEY = process.env.DMXAPI_KEY;
const DMXAPI_BASE_URL = process.env.DMXAPI_BASE_URL || "https://www.dmxapi.cn/v1";

const ANALYSIS_PROMPT_ZH = `请分析这张人像照片，严格按照以下 JSON 格式返回（不要包含其他文字）：

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
}`;

const ANALYSIS_PROMPT_EN = `Analyze this portrait photo and return in the following JSON format (return only the JSON, no other text):

{
  "faceShape": "face shape (round/square/oval/oblong/heart/diamond)",
  "skinTone": "skin tone (fair/warm fair/natural/wheat/tan)",
  "gender": "gender (Male/Female)",
  "ageRange": "age range (e.g. 18-25, 25-30, 30-40)",
  "features": {
    "eyes": "eye shape description",
    "eyebrows": "eyebrow shape description",
    "nose": "nose shape description",
    "lips": "lip shape description"
  },
  "currentHair": {
    "length": "current hair length description",
    "color": "current hair color description",
    "style": "current hairstyle description"
  },
  "recommendedStyles": ["recommended hairstyle 1", "recommended hairstyle 2", "recommended hairstyle 3"]
}`;

function getAnalysisPrompt(lang?: string): string {
  return lang === "en" ? ANALYSIS_PROMPT_EN : ANALYSIS_PROMPT_ZH;
}

async function analyzeWithVolcano(image: string, lang?: string) {
  if (!ARK_API_KEY) {
    throw new Error("火山方舟 API 密钥未配置");
  }

  const prompt = getAnalysisPrompt(lang);

  const response = await fetchWithRetry(`${ARK_BASE_URL}/responses`, {
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
            { type: "input_image", image_url: `data:image/jpeg;base64,${image}` },
            { type: "input_text", text: prompt },
          ],
        },
      ],
      max_output_tokens: 2048,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`火山方舟 API 错误: ${data.error?.message || response.statusText}`);
  }

  const content =
    data.output
      ?.find((item: any) => item.role === "assistant")
      ?.content?.find((c: any) => c.type === "output_text")?.text || "";

  return JSON.parse(content.replace(/```json|```/g, "").trim());
}

async function analyzeWithDmxapi(image: string, lang?: string) {
  if (!DMXAPI_KEY) {
    throw new Error("DMXAPI 密钥未配置");
  }

  const prompt = getAnalysisPrompt(lang);

  const response = await fetchWithRetry(`${DMXAPI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DMXAPI_KEY}`,
    },
    body: JSON.stringify({
      model: "mimo-v2.5",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
            { type: "text", text: prompt },
          ],
        },
      ],
      max_tokens: 2048,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`DMXAPI 错误: ${data.error?.message || response.statusText}`);
  }

  const content = data.choices?.[0]?.message?.content || "";
  return JSON.parse(content.replace(/```json|```/g, "").trim());
}

export async function POST(request: NextRequest) {
  try {
    const { image, provider, lang } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "请提供图片" }, { status: 400 });
    }

    let analysis: any;

    if (provider === "dmxapi") {
      analysis = await analyzeWithDmxapi(image, lang);
    } else {
      analysis = await analyzeWithVolcano(image, lang);
    }

    return NextResponse.json({ analysis, provider: provider || "volcano" });
  } catch (error) {
    console.error("人脸分析失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "分析失败" },
      { status: 500 }
    );
  }
}
