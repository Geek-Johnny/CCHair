# CCHair - AI 发型设计参考

**v1.1** — 体验优化 + 分享卡片 + 随机生成

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
│   ├── db.ts               # IndexedDB 操作（history CRUD）
│   └── share-card.ts       # Canvas 分享卡片渲染（合成原图+分析+结果）
├── components/
│   ├── header.tsx           # 顶部导航（含历史记录按钮）
│   ├── main-panel.tsx       # 主面板（状态管理中枢，含历史自动保存）
│   ├── upload-area.tsx      # 拖拽上传（含格式/大小校验）
│   ├── analysis-card.tsx    # 分析结果卡片（含骨架屏 + 错误状态）
│   ├── hair-style-selector.tsx # 发型选择器（AI推荐 + 热门 + 定制 + 随机生成）
│   ├── history-panel.tsx    # 历史记录抽屉（列表/加载/删除）
│   ├── result-grid.tsx      # 结果网格（含分享卡片按钮）
│   ├── result-card.tsx      # 单个结果（放大/下载/分享 + Lightbox 键盘支持）
│   ├── toast.tsx            # Toast 通知组件（error/success/info）
│   └── index.ts             # 统一导出
├── types/
│   └── index.ts             # TypeScript 类型 + 发型/颜色数据
├── public/                  # 静态资源
├── Pictures/                # 示例图片
├── CLAUDE.md
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
npm run dev       # 启动开发服务器（已内置 NODE_TLS_REJECT_UNAUTHORIZED=0）
npm run build     # 生产构建
npm run lint      # 代码检查
```

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
✅ 阶段 5.5：体验优化 + 新功能
  - Toast 通知组件（API 错误/成功反馈，自动消失）
  - 上传校验（格式限制 JPG/PNG/WebP，大小上限 10MB）
  - 移动端上传兼容性（DOM 内隐藏 input + ref 触发）
  - Lightbox 键盘支持（Escape 关闭 + body 滚动锁定 + 无障碍）
  - 性别过滤 bug 修复（gender 未定义时显示全部热门发型）
  - 响应式布局（移动端单列，md+ 双列）
  - 分析失败状态显示（红色错误卡片 + toast 提示）
  - 结果网格空状态图标优化
  - 随机生成 6 款发型（一键从发型池随机选取）
  - 分享卡片（Canvas 合成原图+分析+结果为 PNG，含品牌信息）
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
