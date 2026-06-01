# CCHair - AI 发型设计参考

**v1.2** — Freemium 额度系统 + 套餐购买

## 项目概述
上传人像照，AI 分析脸型五官，生成多款发型效果图。

## 技术栈
- **框架**: Next.js 15 (App Router) + TypeScript
- **样式**: Tailwind CSS v4
- **人脸分析**: Doubao-seed-2.0-mini (火山方舟, Responses API) / Mimo-V2.5 (DMXAPI, OpenAI 格式)
- **图像生成**: Seedream 5.0 Lite (火山方舟, images/generations API)
- **用户识别**: Cookie-based session（匿名，无注册）
- **数据存储**: JSON 文件（轻量级，data/ 目录，已 gitignore）

## 目录结构
```
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面（Client Component，管理历史状态）
│   ├── globals.css         # Tailwind 全局样式
│   └── api/
│       ├── analyze/route.ts    # 人脸分析（双模型，不扣额度）
│       ├── generate/route.ts   # 发型生成（含额度检查 + 扣减）
│       ├── quota/route.ts      # GET 额度查询
│       ├── orders/route.ts     # GET/POST 订单管理
│       └── webhook/route.ts    # POST 支付回调
├── lib/
│   ├── db.ts               # IndexedDB 操作（history CRUD）
│   ├── session.ts          # Cookie session 管理
│   ├── store.ts            # JSON 文件存储（用户/订单 CRUD）
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
│   ├── quota-bar.tsx        # 额度状态栏（Header 右侧）
│   ├── plan-selector.tsx    # 套餐购买弹窗
│   └── index.ts             # 统一导出
├── types/
│   ├── index.ts             # TypeScript 类型 + 发型/颜色数据
│   └── plan.ts              # 套餐定义（GO/Plus/Pro）
├── data/                    # JSON 文件存储（gitignore）
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
人脸分析，支持双模型切换（不扣额度）：
- `provider: "volcano"`（默认）：调用 Doubao-seed-2.0-mini（火山方舟 Responses API）
- `provider: "dmxapi"`：调用 Mimo-V2.5（DMXAPI, OpenAI 兼容格式）
```json
// Request: { "image": "base64编码的图片", "provider": "volcano" | "dmxapi" }
// Response: { "analysis": { FaceAnalysis }, "provider": "volcano" | "dmxapi" }
```

### POST /api/generate
发型生成（含额度检查），调用 Seedream 5.0 Lite。
```json
// Request: { "image": "base64编码的图片", "hairstyle": "发型描述(如微分碎盖)" }
// Response: { "image": "base64编码的结果图", "remaining": 剩余次数 }
// 额度不足: { "error": "额度用完", "code": "QUOTA_EXCEEDED" } (403)
```

### GET /api/quota
查询当前 session 额度。
```json
// Response: { "freeUsed": N, "freeLimit": 3, "paidCredits": N, "totalRemaining": N }
```

### POST /api/orders
创建购买订单。
```json
// Request: { "plan": "go" | "plus" | "pro" }
// Response: { "orderId": "xxx", "payUrl": "/pay/xxx", "plan": {...} }
```

### GET /api/orders
查询当前 session 历史订单。

### POST /api/webhook
支付平台回调（待对接实际支付平台）。

## 商业模式
- **免费额度**：每个账户永久 3 次生成（Cookie session，无需注册）
- **付费套餐**（限时 50% 折扣）：
  - GO level：5 次 / ¥4.9（原价 ¥10）
  - Plus level：15 次 / ¥9.9（原价 ¥20）— 推荐
  - Pro level：30 次 / ¥14.9（原价 ¥30）

## 成本参考
| 服务 | 模型 | 单次调用 |
|------|------|---------|
| 人脸分析（火山方舟） | Doubao-seed-2.0-mini | ~0.01元 |
| 人脸分析（DMXAPI） | Mimo-V2.5 | ~0.016元（降价后 ~0.004元） |
| 发型生成 | Seedream 5.0 Lite | ~0.25元/张 |

## 项目状态
✅ 阶段 1-5.5：核心功能 + 体验优化完成
✅ 阶段 6.1：Freemium 额度系统
  - Cookie-based 匿名 session（1 年有效期）
  - JSON 文件存储用户数据和订单
  - 额度检查注入 generate API（免费 3 次/日）
  - 额度耗尽自动提示升级
  - Header 额度状态栏（剩余次数 + 升级按钮）
  - 套餐购买弹窗（GO/Plus/Pro 三列卡片）
⬜ 阶段 6.2：支付对接
  - [ ] 接入实际支付平台（草莓支付/PayJS 等）
  - [ ] 支付回调签名验证
  - [ ] 支付成功后自动充值额度
  - [ ] 部署方案（Vercel + data/ 持久化）
