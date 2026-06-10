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

export interface GenerateItem {
  hairstyle: string; // prompt sent to API
  name: string;     // display name
  tags: string[];
}

export interface PopularHairstyle {
  id: string;
  name: string;
  description: string;
  gender: "male" | "female";
}

export interface HairColor {
  id: string;
  name: string;
  hex: string;
  description: string;
  gender: "male" | "female";
}

export interface HistoryRecord {
  id: string;
  originalImage: string;
  analysis: FaceAnalysis;
  results: GenerationResult[];
  createdAt: number;
}

export const POPULAR_HAIRSTYLES: PopularHairstyle[] = [
  // 男生
  { id: "m-micro-chopped", name: "微分碎盖", gender: "male", description: "轻薄碎剪带一点遮额头的感觉，蓬松自然，日常最稳。" },
  { id: "m-tinfoil-perm", name: "锡纸烫", gender: "male", description: "卷度立体，纹理感明显，带一点痞帅和少年感。" },
  { id: "m-side-back-part", name: "侧背三七分", gender: "male", description: "三七分加侧背线条，清爽利落，通勤和日常都很适配。" },
  { id: "m-wet-wolf-tail", name: "狼尾湿发", gender: "male", description: "狼尾层次配湿发质感，松弛又有个性，韩日系都常见。" },
  { id: "m-korean-middle-part", name: "韩式中分", gender: "male", description: "中分线条柔和，整体更显干净和轮廓感。" },
  { id: "m-comma-bangs", name: "逗号刘海", gender: "male", description: "刘海末端做出逗号弧度，脸部线条更柔和，韩系感强。" },
  { id: "m-japanese-wolf-tail", name: "日系狼尾", gender: "male", description: "前短后长、层次更明显，风格感强但不会太夸张。" },
  { id: "m-backslick", name: "无刘海大背头", gender: "male", description: "额头完全露出，轮廓干净，气场更成熟利落。" },
  { id: "m-american-spike", name: "美式前刺", gender: "male", description: "顶部向前做出前刺线条，干练有精神，个性很强。" },
  { id: "m-buzzcut", name: "寸头", gender: "male", description: "极简利落，几乎不用打理，最清爽也最耐看。" },
  // 女生
  { id: "f-french-bangs-clavicle", name: "法式刘海锁骨发", gender: "female", description: "锁骨长度配法式感刘海，松弛又显气质，是很稳的日常款。" },
  { id: "f-layered-wave", name: "层次大波浪", gender: "female", description: "层次更明显的大卷发，蓬松有氛围感，显发量也显脸小。" },
  { id: "f-high-crown-straight", name: "高颅顶直发", gender: "female", description: "直发轮廓干净，但顶部更蓬松，视觉上更显精神。" },
  { id: "f-princess-cut", name: "公主切", gender: "female", description: "脸侧保留标志性短发片，轮廓很有记忆点，日常也够出挑。" },
  { id: "f-korean-c-curve-bob", name: "韩式 C 卷短发", gender: "female", description: "短发发尾带 C 卷弧度，韩系感强，显温柔也显脸小。" },
  { id: "f-fringe-cut", name: "流苏剪", gender: "female", description: "碎感更轻、线条更软，整体看起来灵动又不厚重。" },
  { id: "f-japanese-wool-perm", name: "日系羊毛卷", gender: "female", description: "卷度更细密，氛围感很强，复古里带一点俏皮。" },
  { id: "f-bangs-mushroom", name: "齐刘海蘑菇头", gender: "female", description: "齐刘海搭配圆润轮廓，软萌感很强，辨识度高。" },
  { id: "f-mullet-bob", name: "鲻鱼短发", gender: "female", description: "短发里带一点前短后长的层次，甜酷风格很明显。" },
  { id: "f-ear-fade-short", name: "耳上渐变短发", gender: "female", description: "耳上长度加渐变处理，干净利落，中性酷感很强。" },
];

export const HAIR_COLORS: Record<"male" | "female", HairColor[]> = {
  male: [
    { id: "m-black-tea", name: "黑茶色", hex: "#2A2624", description: "接近自然黑发的深色调，低调耐看，适合想要干净感的人。", gender: "male" },
    { id: "m-ash-brown", name: "亚麻灰棕", hex: "#7A6F65", description: "带一点灰感的棕色，氛围柔和，日常也不会太跳。", gender: "male" },
    { id: "m-milk-tea-brown", name: "奶茶棕", hex: "#8D7A68", description: "温暖的浅棕调，显气色，也很适合做轻松自然的风格。", gender: "male" },
    { id: "m-blue-black-gradient", name: "蓝黑渐变", hex: "#1A2330", description: "黑中带蓝的深色调，光线下更有层次，整体更利落。", gender: "male" },
    { id: "m-silver-gray", name: "银灰色", hex: "#D1D1D6", description: "偏浅的冷灰色，风格感强，适合想要更醒目的发色。", gender: "male" },
    { id: "m-caramel-brown", name: "焦糖棕", hex: "#9A7B5B", description: "暖调金棕，提气色，整体更有亲和力。", gender: "male" },
    { id: "m-smoky-gray", name: "雾感灰", hex: "#BABAC0", description: "柔和的灰调，视觉更轻，显得清爽干净。", gender: "male" },
    { id: "m-deep-chestnut", name: "深栗棕", hex: "#6D4C41", description: "偏深的栗棕色，稳重、耐看，适合更成熟的气质。", gender: "male" },
    { id: "m-rose-gold-gray", name: "玫瑰金灰", hex: "#A98B98", description: "灰里带一点玫瑰调，柔和又有一点特别。", gender: "male" },
    { id: "m-green-streaks", name: "墨绿挑染", hex: "#2D3B33", description: "深绿调的挑染感，低调但有辨识度。", gender: "male" },
  ],
  female: [
    { id: "f-amaranthine", name: "亚麻青", hex: "#8CA6A6", description: "青灰里带一点亚麻感，清爽又显白。", gender: "female" },
    { id: "f-black-tea-gray", name: "黑茶灰", hex: "#2F2E2C", description: "深色里带一点灰感，干净、轻熟、很耐看。", gender: "female" },
    { id: "f-cold-tea-brown", name: "冷茶棕", hex: "#7D756A", description: "偏冷的茶棕色，适配度高，素颜也自然。", gender: "female" },
    { id: "f-smoky-gray-brown", name: "雾感灰棕", hex: "#8A847E", description: "灰调更明显，整体会更清冷高级。", gender: "female" },
    { id: "f-rose-cold-brown", name: "玫瑰冷棕", hex: "#9E8B93", description: "棕色里揉一点玫瑰感，温柔又不单调。", gender: "female" },
    { id: "f-cream-gray", name: "奶油灰", hex: "#D8D8D8", description: "很浅的奶感灰色，轻盈、柔和，存在感不强但很特别。", gender: "female" },
    { id: "f-ash-gold", name: "亚麻金", hex: "#D4C39A", description: "偏浅的亚麻金调，柔和显白，带一点轻盈的阳光感。", gender: "female" },
    { id: "f-mint-beige-brown", name: "薄荷米棕", hex: "#A2A99A", description: "带一点薄荷感的米棕，清新、柔和、很显白。", gender: "female" },
    { id: "f-cherry-pink-brown", name: "樱花粉棕", hex: "#D9A5B3", description: "粉棕色调更活泼，甜感更明显。", gender: "female" },
    { id: "f-ink-green-gradient", name: "墨绿渐变", hex: "#3A4A42", description: "深绿与墨色过渡，低调里带一点酷感。", gender: "female" },
  ],
};

export interface Order {
  id: string;
  sessionId: string;
  plan: "go" | "plus" | "pro";
  amount: number;
  credits: number;
  status: "pending" | "paid" | "failed";
  createdAt: number;
  paidAt?: number;
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
    ],
  },
];
