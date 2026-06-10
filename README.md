# HairMirra 发型魔镜 - AI 发型设计与试戴

> 上传照片，让 AI 魔镜看见更适合你的美。
> **v1.6** — 发型/颜色选项优化 + 分享卡预览流程 + 预览交互与卡面风格统一

## 核心功能

1. **人像上传** — 拖拽或点击上传，支持 JPG/PNG/WebP，≤10MB 校验
2. **AI 人脸分析** — Mimo-V2.5 (DMXAPI) 智能识别脸型、肤色、五官特征
3. **发型选择** — 四种方式：
   - AI 推荐发型（分析结果自动推荐 3 款）
   - 热门发型预设（20 款男/女热门，悬浮看详细介绍）
   - 定制发型（长度/风格/类型/颜色单选 + 自定义输入，颜色支持男女分组色盘）
   - **随机生成 3 款**（一键从发型池随机选取，匹配免费 3 次模式）
4. **批量生成** — 多选后一键确认，批量生成效果图
5. **网格展示** — 多款发型效果以网格排列，支持放大、下载和分享
6. **分享卡片** — 先预览再下载，将原图、脸型分析、生成结果合成为一张精美图片
7. **历史记录** — 分析结果和生成结果自动保存（IndexedDB），支持查看、恢复和删除
8. **Freemium 额度** — 每个账户永久免费 3 次生成，付费套餐解锁更多
9. **影棚级界面** — 黑金深色工作台，突出照片预览、发型选择和生成作品墙
10. **品牌资产** — HairMirra 英文字标、镜面双 R favicon、分享卡片统一品牌露出

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
| 数据存储 | Upstash Redis（持久化额度/订单，本地无配置时内存 fallback） |
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
# Upstash Redis（额度持久化，生产推荐；本地未配置时自动使用内存 fallback）
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
├── components/               # React 组件（黑金影棚 UI）
├── types/                    # TypeScript 类型 + 发型/颜色数据
├── public/                   # 静态资源
│   ├── logo-hairmirra-gold.svg # 黑金字标 Logo
│   ├── logo-hairmirra.svg      # 纯字标 Logo
│   └── favicon.svg             # 镜面双 R favicon
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

## 最近更新

### v1.6
- 定制发型的颜色区改为男女分组色盘展示，保留自定义输入，颜色提示词支持色值信息
- 热门发型与颜色 tooltip 统一为更收敛的悬浮拟态，边缘按钮不再溢出
- 分享卡片改为黑金影棚风格，并支持生成后先预览再下载
- 结果图放大预览与分享卡预览均支持点击图片本身关闭，提升交互一致性
- 分享卡按钮文案改为“预览分享卡片”，结果下载入口文案同步更新
- 随机生成数量与免费 3 次模式对齐为 3 款

### v1.5
- 品牌从 CCHair 升级为 HairMirra 发型魔镜，核心 slogan 为「看见，另一个自己」
- 页面 title、metadata、分享卡片、下载文件名、前端文案统一替换为 HairMirra
- 新增黑金镜面质感 Logo 与镜面双 R favicon，移动端 Header 使用高级字标
- 移动端 Header 调整为单行：Logo → 额度 → 语言图标 → 历史图标
- 生成完成后的历史记录写入增加异常保护，IndexedDB 保存失败不再导致红屏
- 分享/复制兜底增加权限失败提示，浏览器拒绝 Clipboard API 时不再打断页面

### v1.4
- 全站 UI 重构为黑金影棚工作台，移除白紫模板感
- 首页 slogan 更新为「精准识别脸型，匹配理想发型」
- 优化上传预览、发型选择滚动、结果展示、历史抽屉、购买弹窗等交互细节
- 修复 Seedream 返回相对图片 URL（如 `/pipeline`）时的服务端解析问题
- 本地未配置 Upstash Redis 时自动使用内存 fallback，避免额度查询和生成失败
- 分析结果卡片增加字段缺失容错

## 在线访问

🔗 **https://www.aiheaven.top**

## License

MIT
