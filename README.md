# CCHair - AI 发型设计

> 上传人像照，AI 分析脸型五官，一键生成多款发型效果图
> **v1.3** — 已上线 https://www.aiheaven.top

## 核心功能

1. **人像上传** — 拖拽或点击上传，支持 JPG/PNG/WebP，≤10MB 校验
2. **AI 人脸分析** — Mimo-V2.5 (DMXAPI) 智能识别脸型、肤色、五官特征
3. **发型选择** — 四种方式：
   - AI 推荐发型（分析结果自动推荐 3 款）
   - 热门发型预设（20 款男/女热门，悬浮看详细介绍）
   - 定制发型（长度/风格/类型/颜色单选 + 自定义输入）
   - **随机生成 6 款**（一键从发型池随机选取，快速出效果）
4. **批量生成** — 多选后一键确认，批量生成效果图
5. **网格展示** — 多款发型效果以网格排列，支持放大、下载和分享
6. **分享卡片** — 将原图、脸型分析、生成结果合成为一张精美图片，方便社交分享
7. **历史记录** — 分析结果和生成结果自动保存（IndexedDB），支持查看、恢复和删除
8. **Freemium 额度** — 每个账户永久免费 3 次生成，付费套餐解锁更多

## 商业模式

| 套餐 | 次数 | 价格 | 折扣 |
|------|------|------|------|
| 免费 | 永久 3 次 | ¥0 | - |
| GO level | 5 次 | ¥4.9 | 原价 ¥10，5折 |
| Plus level | 15 次 | ¥9.9 | 原价 ¥20，5折 |
| Pro level | 30 次 | ¥14.9 | 原价 ¥30，5折 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 人脸分析 | Mimo-V2.5 (DMXAPI) |
| 图像生成 | Seedream 5.0 Lite (火山方舟) |
| 用户识别 | FingerprintJS 浏览器指纹（匿名） |
| 数据存储 | Upstash Redis（持久化额度/订单） |
| 部署 | Vercel（自动 SSL + 边缘网络） |

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
创建 `.env.local` 文件：
```
# 发型生成 (Seedream 5.0 Lite)
ARK_API_KEY=你的火山方舟API Key
# 人脸分析 (Mimo-V2.5)
DMXAPI_KEY=你的DMXAPI Key
DMXAPI_BASE_URL=https://www.dmxapi.cn/v1
# Upstash Redis（额度持久化）
UPSTASH_REDIS_REST_URL=你的Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN=你的Upstash Redis Token
# 管理员指纹（无限额度，可选）
ADMIN_FINGERPRINT=管理员浏览器指纹ID
```

> 需要先开通 [火山方舟](https://www.volcengine.com/product/ark) 服务，获取 API Key，并开通相应模型。

### 3. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
CCHair/
├── app/
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 主页面（Client Component）
│   ├── globals.css           # 全局样式
│   └── api/
│       ├── analyze/route.ts  # 人脸分析 API（不扣额度，含重试）
│       ├── generate/route.ts # 发型生成 API（含额度检查 + 管理员豁免）
│       ├── quota/route.ts    # 额度查询 API
│       ├── orders/route.ts   # 订单管理 API
│       └── webhook/route.ts  # 支付回调 API
├── lib/
│   ├── db.ts                 # IndexedDB 操作（历史记录 CRUD）
│   ├── use-fingerprint.ts    # FingerprintJS hook（浏览器指纹）
│   ├── store.ts              # Upstash Redis 存储（用户/订单 CRUD）
│   └── share-card.ts         # Canvas 分享卡片渲染
├── components/               # React 组件（12个）
├── types/                    # TypeScript 类型 + 发型/颜色数据
├── public/                   # 静态资源
├── Pictures/                 # 示例图片
├── CLAUDE.md                 # AI 辅助文档
└── README.md
```

## API 成本参考

| 服务 | 模型 | 单次调用 |
|------|------|---------|
| 人脸分析 | Mimo-V2.5 (DMXAPI) | ~0.004元 |
| 发型生成 | Seedream 5.0 Lite | ~0.25元/张 |
| 数据存储 | Upstash Redis | 免费额度 10K 命令/天 |

## 在线访问

🔗 **https://www.aiheaven.top**

## License

MIT
