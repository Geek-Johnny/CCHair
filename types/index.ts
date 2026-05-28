export interface FaceAnalysis {
  faceShape: string;
  skinTone: string;
  gender: string;
  ageRange: string;
  features: {
    eyes: string;
    eyebrows: string;
    nose: string;
    lips: string;
  };
  currentHair: {
    length: string;
    color: string;
    style: string;
  };
  recommendedStyles: string[];
}

export interface HairStyle {
  id: string;
  name: string;
  category: string;
  tags: string[];
  prompt: string;
}

export interface GenerationResult {
  id: string;
  hairstyleName: string;
  hairstyleTags: string[];
  imageData: string; // base64 or URL
  timestamp: number;
}

export interface HistoryRecord {
  id: string;
  originalImage: string;
  analysis: FaceAnalysis;
  results: GenerationResult[];
  createdAt: number;
}

export const HAIR_CATEGORIES = [
  {
    name: "按长度",
    options: [
      { id: "ultra-short", name: "极短" },
      { id: "short", name: "短发" },
      { id: "medium", name: "及肩" },
      { id: "shoulder", name: "中长发" },
      { id: "long", name: "长发" },
    ],
  },
  {
    name: "按风格",
    options: [
      { id: "straight", name: "直发" },
      { id: "curly", name: "卷发" },
      { id: "wave", name: "波浪" },
      { id: "braid", name: "编发" },
      { id: "updo", name: "盘发" },
    ],
  },
  {
    name: "按类型",
    options: [
      { id: "bangs", name: "齐刘海" },
      { id: "side-bangs", name: "斜刘海" },
      { id: "no-bangs", name: "无刘海" },
      { id: "layered", name: "层次剪" },
      { id: "messy", name: "碎发" },
    ],
  },
];
