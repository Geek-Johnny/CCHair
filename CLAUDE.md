# HairMirra 发型魔镜 - AI 发型设计

**v1.6** — 发型/颜色选项优化 + 分享卡预览流程 + 预览交互与卡面风格统一

## 项目概述
上传照片，让 AI 魔镜发现你的美。用户上传人像照后，AI 分析脸型五官并生成多款发型效果图。

## 品牌设定
- **中文名**: 发型魔镜
- **英文名**: HairMirra
- **Slogan**: 看见，另一个自己
- **产品描述**: 上传照片，让 AI 魔镜发现你的美
- **页面标题**: HairMirra 发型魔镜 - AI 发型设计
- **品牌语气**: 温柔、高级、审美
- **主视觉方向**: 高级感、黑金质感、影棚风格
- **核心 CTA**: 开始试发型、上传照片、看看适合我的发型
- **分享卡片文案**: 我在 HairMirra 看见了另一个自己

## 技术栈
- **框架**: Next.js 15 (App Router) + TypeScript
- **样式**: Tailwind CSS v4
- **人脸分析**: Mimo-V2.5 (DMXAPI, OpenAI 格式)
- **图像生成**: Seedream 5.0 Lite (火山方舟, images/generations API)
- **用户识别**: FingerprintJS 浏览器指纹（匿名，无注册）
- **数据存储**: Upstash Redis（持久化额度/订单数据）
- **部署**: Vercel（自动 SSL + 边缘网络）
- **视觉风格**: 黑金影棚工作台（深色背景 + 暖金强调 + 作品墙结果）
- **品牌资产**: HairMirra 高级衬线字标 + 镜面双 R favicon

## 目录结构
```
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面（Client Component，管理历史状态）
│   ├── globals.css         # Tailwind 全局样式
│   └── api/
│       ├── analyze/route.ts    # 人脸分析（双模型，不扣额度，含重试）
│       ├── generate/route.ts   # 发型生成（含额度检查 + 扣减 + 管理员豁免）
│       ├── quota/route.ts      # POST 额度查询（含管理员识别）
│       ├── orders/route.ts     # GET/POST 订单管理
│       └── webhook/route.ts    # POST 支付回调
├── lib/
│   ├── db.ts               # IndexedDB 操作（history CRUD）
│   ├── use-fingerprint.ts  # FingerprintJS hook（浏览器指纹）
│   ├── store.ts            # Upstash Redis 存储（用户/订单 CRUD，本地无配置时内存 fallback）
│   └── share-card.ts       # Canvas 分享卡片渲染
├── components/
│   ├── header.tsx           # 顶部导航（含额度栏 + 套餐购买入口）
│   ├── main-panel.tsx       # 主面板（状态管理中枢）
│   ├── upload-area.tsx      # 拖拽上传（含格式/大小校验）
│   ├── analysis-card.tsx    # 分析结果卡片（含骨架屏 + 错误状态）
│   ├── hair-style-selector.tsx # 发型选择器（AI推荐 + 热门 + 定制 + 随机）
│   ├── history-panel.tsx    # 历史记录抽屉
│   ├── result-grid.tsx      # 结果网格（含分享卡片按钮）
│   ├── result-card.tsx      # 单个结果（放大/下载/分享）
│   ├── toast.tsx            # Toast 通知组件
│   ├── quota-bar.tsx        # 额度状态栏（管理员/免费/付费用户区分显示）
│   ├── plan-selector.tsx    # 套餐购买弹窗
│   └── index.ts             # 统一导出
├── types/
│   ├── index.ts             # TypeScript 类型 + 发型/颜色数据
│   └── plan.ts              # 套餐定义（GO/Plus/Pro）
├── data/                    # JSON 文件存储（gitignore）
├── public/                  # 静态资源
│   ├── logo-hairmirra-gold.svg # 黑金字标 Logo
│   ├── logo-hairmirra.svg      # 纯字标 Logo
│   └── favicon.svg             # 镜面双 R favicon
├── Pictures/                # 示例图片
├── CLAUDE.md
└── README.md
```

## 环境变量
在 `.env.local` 或 Vercel Dashboard 中配置：
```
# 发型生成 (Seedream 5.0 Lite)
ARK_API_KEY=你的火山方舟API Key
# 人脸分析 - 火山方舟 (Doubao-seed-2.0-mini)，可与生成共用同一 Key
ARK_API_KEY_ANALYZE=你的火山方舟API Key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
# 人脸分析 - DMXAPI (Mimo-V2.5)，可选
DMXAPI_KEY=你的DMXAPI Key
DMXAPI_BASE_URL=https://www.dmxapi.cn/v1
# Upstash Redis（额度持久化，生产推荐；本地未配置时自动使用内存 fallback）
UPSTASH_REDIS_REST_URL=你的Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN=你的Upstash Redis Token
# 管理员指纹（无限额度，可选）
ADMIN_FINGERPRINT=管理员浏览器指纹ID
```

## 开发命令
```bash
npm run dev       # 启动开发服务器（已内置 NODE_TLS_REJECT_UNAUTHORIZED=0）
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build  # 当前本地证书环境下的生产构建
npm run lint      # 代码检查
```

## API 参考

### POST /api/analyze
人脸分析，使用 Mimo-V2.5（DMXAPI, OpenAI 兼容格式），不扣额度。含自动重试机制。
```json
// Request: { "image": "base64编码的图片", "provider": "dmxapi" }
// Response: { "analysis": { FaceAnalysis }, "provider": "dmxapi" }
```

### POST /api/generate
发型生成（含额度检查），调用 Seedream 5.0 Lite。含自动重试机制。管理员豁免额度检查。
兼容 Seedream 返回 `b64_json` 或相对图片 URL（如 `/pipeline`）的情况。
```json
// Request: { "image": "base64编码的图片", "hairstyle": "发型描述", "fingerprint": "浏览器指纹" }
// Response: { "image": "base64编码的结果图", "remaining": 剩余次数 }
// 额度不足: { "error": "额度用完", "code": "QUOTA_EXCEEDED" } (403)
```

### POST /api/quota
查询当前用户额度（通过 fingerprint 识别）。
```json
// Request: { "fingerprint": "浏览器指纹" }
// Response: { "freeUsed": N, "freeLimit": 3, "freeRemaining": N, "paidCredits": N, "totalRemaining": N, "isAdmin": true/false }
```

### POST /api/orders
创建购买订单。
```json
// Request: { "plan": "go" | "plus" | "pro", "fingerprint": "浏览器指纹" }
// Response: { "orderId": "xxx", "payUrl": "/pay/xxx", "plan": {...} }
```

### GET /api/orders?fingerprint=xxx
查询当前用户历史订单。

### POST /api/webhook
支付平台回调（待对接实际支付平台）。

## 商业模式
- **免费额度**：每个账户永久 3 次生成（FingerprintJS 指纹识别，无需注册）
- **管理员**：配置 ADMIN_FINGERPRINT 后无限额度
- **付费套餐**（限时 50% 折扣）：
  - GO level：5 次 / ¥4.9（原价 ¥10）
  - Plus level：15 次 / ¥9.9（原价 ¥20）— 推荐
  - Pro level：30 次 / ¥14.9（原价 ¥30）

## 成本参考
| 服务 | 模型 | 单次调用 |
|------|------|---------|
| 人脸分析 | Mimo-V2.5 (DMXAPI) | ~0.004元 |
| 发型生成 | Seedream 5.0 Lite | ~0.25元/张 |
| 数据存储 | Upstash Redis | 免费额度 10K 命令/天 |

## 部署信息
- **生产环境**: https://www.aiheaven.top
- **Vercel 项目**: cchair
- **GitHub**: https://github.com/Geek-Johnny/CCHair

## 项目状态
✅ 阶段 1-5.5：核心功能 + 体验优化完成
✅ 阶段 6.1：Freemium 额度系统
  - FingerprintJS 浏览器指纹识别（替代 Cookie session）
  - Upstash Redis 持久化存储（替代 JSON 文件）
  - 额度检查注入 generate API（免费 3 次）
  - 管理员无限额度（ADMIN_FINGERPRINT 环境变量）
  - 额度耗尽自动提示升级
  - Header 额度状态栏（管理员/免费/付费用户区分显示）
  - 套餐购买弹窗（GO/Plus/Pro 三列卡片）
  - API 自动重试机制（缓解网络不稳定）
✅ 部署：Vercel 生产环境上线
  - 自动 SSL 证书
  - 边缘网络加速
  - GitHub 自动部署
✅ 阶段 6.1.5：UI 与本地开发稳定性优化
  - 全站视觉重构为黑金影棚工作台，弱化白紫 AI 模板感
  - Header、上传区、分析卡、发型选择器、结果墙、历史抽屉、购买弹窗统一深色设计
  - 首页 slogan 更新为「精准识别脸型，匹配理想发型」
  - 分析结果卡片兼容缺失 `recommendedStyles/features/currentHair` 字段
  - Seedream 生成结果兼容 `b64_json` 与相对 URL（修复 `/pipeline` 解析失败）
  - Upstash Redis 未配置时自动使用内存 fallback，避免本地额度查询/生成失败
  - 根布局添加 hydration warning 抑制，兼容浏览器插件注入 html 属性
✅ 阶段 6.1.6：HairMirra 品牌升级
  - 品牌从 CCHair 升级为 HairMirra 发型魔镜
  - 页面 metadata、分享卡片、下载文件名、主要文案统一替换为 HairMirra
  - 新增黑金镜面字标 Logo 与镜面双 R favicon
  - 移动端 Header 调整为单行布局：Logo → 额度 → 语言图标 → 历史图标
  - 生成结果写入 IndexedDB 历史记录失败时不再触发红屏
  - 分享/复制兜底处理 Clipboard API 权限拒绝，失败时显示轻提示
✅ 阶段 6.1.7：颜色与分享交互优化
  - 定制发型的颜色区改为男女分组色盘展示，保留自定义输入，颜色提示词包含色值信息
  - 热门发型与颜色说明统一为更收敛的悬浮拟态，边缘按钮不再溢出
  - 分享卡片改为黑金影棚风格，并支持先预览再下载
  - 结果图放大预览和分享卡预览都支持点击图片本身关闭
  - 随机生成数量与免费 3 次模式对齐为 3 款
⬜ 阶段 6.2：支付对接
  - [ ] 接入实际支付平台（草莓支付/PayJS 等）
  - [ ] 支付回调签名验证
  - [ ] 支付成功后自动充值额度
⬜ 优化项
  - [ ] 迁移到国内部署平台（解决 Vercel → 国内 API 网络不稳定问题）
