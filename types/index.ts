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

export interface HistoryRecord {
  id: string;
  originalImage: string;
  analysis: FaceAnalysis;
  results: GenerationResult[];
  createdAt: number;
}

export const POPULAR_HAIRSTYLES: PopularHairstyle[] = [
  // 男生
  { id: "m-micro-chopped", name: "微分碎盖", gender: "male", description: "轻薄碎剪搭配微遮额头设计，整体自然蓬松，适配细软发质，日常易打理。" },
  { id: "m-american-spike", name: "美式前刺", gender: "male", description: "两侧渐变推短，顶部发丝抓出尖刺造型，风格痞帅，凸显脸部轮廓，圆脸友好。" },
  { id: "m-gradient-buzz", name: "渐变寸头", gender: "male", description: "顶部短发利落，两侧做渐变处理，清爽干净几乎无需打理，强化下颌线条。" },
  { id: "m-morgan-chopped-perm", name: "摩根碎盖烫", gender: "male", description: "摩根烫垫高颅顶，结合碎盖层次，打造头包脸效果，不挑脸型。" },
  { id: "m-tinfoil-perm", name: "新款锡纸烫", gender: "male", description: "采用钢夹造型，卷度立体自然，搭配轻薄刘海，可修饰高颧骨、菱形脸。" },
  { id: "m-wolf-cut", name: "潮流狼尾卷", gender: "male", description: "两侧渐变剪裁，后脑勺发丝外翻卷曲，个性痞帅，适合留长发过渡期。" },
  { id: "m-korean-part", name: "韩式三七分", gender: "male", description: "柔和分线设计，顶部打造轻微纹理，风格简约高级，职场、日常都适配。" },
  { id: "m-brow-chopped", name: "齐眉碎盖", gender: "male", description: "刘海长度至眉毛，发尾带有自然弧度，风格温柔减龄，少年感十足。" },
  { id: "m-textured-side-part", name: "纹理侧分", gender: "male", description: "整体做凌乱纹理烫，搭配侧分线条，气质轻熟沉稳，弱化方脸硬朗感。" },
  { id: "m-japanese-gradient", name: "日系渐变短发", gender: "male", description: "两侧自然渐变过渡，顶部造型灵活多变，风格阳光干净，四季百搭。" },
  // 女生
  { id: "f-french-layered", name: "法式层次锁骨发", gender: "female", description: "高层次碎剪，发尾微微外翻，蓬松显发量，修饰脸颊，素颜也适配。" },
  { id: "f-wolf-cut", name: "网红狼尾剪", gender: "female", description: "前短后长搭配不规则层次，慵懒随性，有效垫高颅顶，主打甜酷风格。" },
  { id: "f-air-bangs-bob", name: "空气刘海波波头", gender: "female", description: "长度齐下巴，发尾自然内扣，搭配空气刘海，软萌减龄，圆脸首选。" },
  { id: "f-saline-ultra-short", name: "盐系中性超短发", gender: "female", description: "发丝长度在耳朵上方，顶部增加蓬松层次，风格酷飒，凸显立体五官。" },
  { id: "f-soft-leaf", name: "柔叶剪", gender: "female", description: "整体做高层次剪裁，发尾自然散开，搭配眉眼刘海，造型轻盈灵动，打理简单。" },
  { id: "f-elizabethan-curl", name: "新伊丽莎白卷", gender: "female", description: "从颧骨位置开始做 S 型卷发，优雅知性，修饰脸型，通勤场景适配度高。" },
  { id: "f-side-part-chin", name: "侧分齐脸短发", gender: "female", description: "侧分碎刘海搭配利落碎剪，简约大气，能够弱化高颧骨缺陷。" },
  { id: "f-lazy-wave", name: "慵懒大波浪", gender: "female", description: "发根蓬松，整体打造自然大卷，氛围感拉满，是长发经典款式。" },
  { id: "f-pixie", name: "精灵短发", gender: "female", description: "后颈发丝推短，顶部保留适量长度，造型精致利落，兼具少年感与精致感。" },
  { id: "f-high-crown-layers", name: "高颅顶层次长发", gender: "female", description: "顶部刻意垫高，整体纵向分层剪裁，显脸小、增发量，适配细软发质。" },
];

export const HAIR_COLORS = [
  { id: "mist-tea-brown", name: "雾茶棕", description: "冷调雾感茶色，黄皮显白，室内低调，发色持久，掉色不易发黄。" },
  { id: "cold-ash-brown", name: "冷茶灰棕", description: "棕底混合灰调，风格清冷高级，黄黑皮适配，素颜也自然。" },
  { id: "espresso-brown", name: "浓缩咖啡棕", description: "深冷棕色调，质感沉稳大气，成熟耐看，职场首选。" },
  { id: "black-tea", name: "黑茶色", description: "接近自然黑发，隐约带蓝雾光泽，可遮盖白发，低调不突兀。" },
  { id: "mint-rice-brown", name: "薄荷米棕", description: "浅棕搭配青雾质感，清新提亮肤色，风格温柔百搭。" },
  { id: "caramel-brown", name: "焦糖棕", description: "暖调金棕，元气提气色，适配白皮、暖黄皮，氛围感十足。" },
  { id: "hazel-latte", name: "榛果奶咖棕", description: "浅奶茶色系，柔和奶感，视觉增发量，细软发质友好。" },
  { id: "mist-ash-gray", name: "雾青灰", description: "茶青结合雾灰，清爽减龄，遮盖白发效果好，日常不挑穿搭。" },
  { id: "blue-black", name: "蓝黑色", description: "基底为黑色，光线下发蓝调，低调小众，风格清冷。" },
];

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
