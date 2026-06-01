# CCHair - AI 发型设计参考

**v1.0** — 核心功能完成（人脸分析 / 发型生成 / 历史记录 / 交互优化）

## 项目概述
上传人像照，AI 分析脸型五官，生成多款发型效果图。

## 技术栈
- **框架**: Next.js 15 (App Router) + TypeScript
- **样式**: Tailwind CSS v4
- **人脸分析**: Doubao-seed-2.0-mini (火山方舟, Responses API) / Mimo-V2.5 (DMXAPI, OpenAI 格式)
- **图像生成**: Seedream 5.0 Lite (火山方舟, images/generations API)

## 目录结构
```
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面（Client Component，管理历史状态）
│   ├── globals.css         # Tailwind 全局样式
│   └── api/
│       ├── analyze/route.ts    # 人脸分析（双模型：火山方舟/DMXAPI）
│       └── generate/route.ts   # 发型生成 → Seedream 5.0 Lite
├── lib/
│   └── db.ts               # IndexedDB 操作（history CRUD）
├── components/
│   ├── header.tsx           # 顶部导航（含历史记录按钮）
│   ├── main-panel.tsx       # 主面板（状态管理中枢，含历史自动保存）
│   ├── upload-area.tsx      # 拖拽上传
│   ├── analysis-card.tsx    # 分析结果卡片（含骨架屏）
│   ├── hair-style-selector.tsx # 发型选择器（AI推荐 + 热门发型 + 定制发型 + 颜色）
│   ├── history-panel.tsx    # 历史记录抽屉（列表/加载/删除）
│   ├── result-grid.tsx      # 结果网格
│   ├── result-card.tsx      # 单个结果（放大/下载）
│   └── index.ts             # 统一导出
├── types/
│   └── index.ts             # TypeScript 类型 + 发型/颜色数据
├── public/                  # 静态资源
├── Pictures/                # 示例图片
├── AGENTS.md
└── README.md
```

## 环境变量
在 `.env.local` 中配置：
```
# 发型生成 (Seedream 5.0 Lite)
ARK_API_KEY=你的火山方舟API Key
# 人脸分析 - 火山方舟 (Doubao-seed-2.0-mini)，可与生成共用同一 Key
ARK_API_KEY_ANALYZE=你的火山方舟API Key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
# 人脸分析 - DMXAPI (Mimo-V2.5)，可选
DMXAPI_KEY=你的DMXAPI Key
DMXAPI_BASE_URL=https://www.dmxapi.cn/v1
```

## 开发命令
```bash
npm run dev       # 启动开发服务器
npm run build     # 生产构建
npm run lint      # 代码检查
```

> ⚠️ 当前环境下构建/运行需设置 `NODE_TLS_REJECT_UNAUTHORIZED=0`（SSL 证书问题）

## API 参考

### POST /api/analyze
人脸分析，支持双模型切换：
- `provider: "volcano"`（默认）：调用 Doubao-seed-2.0-mini（火山方舟 Responses API）
- `provider: "dmxapi"`：调用 Mimo-V2.5（DMXAPI, OpenAI 兼容格式）
```json
// Request: { "image": "base64编码的图片", "provider": "volcano" | "dmxapi" }
// Response: { "analysis": { FaceAnalysis }, "provider": "volcano" | "dmxapi" }
```

### POST /api/generate
发型生成，调用 Seedream 5.0 Lite（火山方舟 images/generations API）。
```json
// Request: { "image": "base64编码的图片", "hairstyle": "发型描述(如微分碎盖)" }
// Response: { "image": "base64编码的结果图" }
```

## 成本参考
| 服务 | 模型 | 单次调用 |
|------|------|---------|
| 人脸分析（火山方舟） | Doubao-seed-2.0-mini | ~0.01元 |
| 人脸分析（DMXAPI） | Mimo-V2.5 | ~0.016元（降价后 ~0.004元） |
| 发型生成 | Seedream 5.0 Lite | ~0.25元/张 |

## 项目状态
✅ 阶段 1-2：项目初始化 + 核心 UI 搭建
✅ 阶段 3：API 对接完成（Doubao-seed 分析 + Seedream 生成均已调通）
✅ 阶段 3.5：业务逻辑优化
  - Mimo-V2.5 人脸分析对接（DMXAPI）
  - AI 推荐发型置顶展示
  - 20 款热门发型预设 + 悬浮拟态描述
  - 定制发型（长度/风格/类型/颜色单选 + 自定义输入）
  - 批量多选 + 确认生成按钮
  - 生成后自动清空选中
✅ 阶段 4：历史记录（IndexedDB）
  - 分析完成后自动保存到 IndexedDB
  - 生成完成后自动追加结果到记录
  - Header 添加 "历史记录" 按钮
  - 右侧抽屉式面板展示历史列表（缩略图 + 脸型 + 结果数 + 时间）
  - 点击恢复历史记录（还原原图、分析、结果）
  - 单条删除，空状态提示
✅ 阶段 5：交互体验优化（分享、批量下载等）
  - 单张结果分享（Web Share API + 剪贴板兜底 "已复制" 反馈）
  - 全部结果批量下载（自动 01-命名，300ms 间隔依次触发）
  - 结果网格顶部显示 "共 N 张" 计数
  - 新结果淡入动画（fadeInUp 0.3s）
  - 悬停操作按钮微放大动效
⬜ 阶段 6：上线准备（支付 + 后端）
  目标：实现简单的付费使用模式，支撑独立上线
  - [ ] 轻量后端（Next.js API Routes 已就绪，扩展即可）
  - [ ] 支付接入（微信/支付宝扫码，推荐接入 [草莓支付](https://caomei.com) 或 [PayJS](https://payjs.cn) 等聚合支付，费率低，个体工商户即可申请）
  - [ ] 额度管理（每次生成扣减次数，免费额度 X 次/日/IP）
  - [ ] 用户识别（手机号验证码 or 浏览器 session_id，轻量无密码）
  - [ ] 生成结果后端存储（OSS/本地文件，返回短链接查看）
  - [ ] 购买页 UI（选择套餐 → 扫码支付 → 完成）
  - [ ] 部署方案（Vercel 免费层 + 对象存储，零服务器维护）
  - 可选：SEO 优化、统计分析、反馈收集
