# CCHair - AI 发型设计参考

> 上传人像照，AI 分析脸型五官，一键生成多款发型效果图

## 核心功能

1. **人像上传** — 拖拽或点击上传人像照片
2. **AI 人脸分析** — 调用豆包 Doubao-seed-2.0-mini 分析脸型、五官、肤色、发质等
3. **发型生成** — 基于分析结果 + Seedream 5.0 Lite，保持面部不变，更换不同发型
4. **表格化展示** — 多款发型效果以网格排列，方便对比
5. **下载 & 放大** — 每张结果可放大查看或下载

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 人脸分析 | Doubao-seed-2.0-mini（火山方舟 Responses API） |
| 图像生成 | Seedream 5.0 Lite（火山方舟） |

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
# 人脸分析 (Doubao-seed-2.0-mini)
ARK_API_KEY_ANALYZE=你的火山方舟API Key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
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
│   ├── page.tsx              # 主页面
│   ├── globals.css           # 全局样式
│   └── api/
│       ├── analyze/route.ts  # 人脸分析 API
│       └── generate/route.ts # 发型生成 API
├── components/               # React 组件（7个）
├── types/                    # TypeScript 类型
├── public/                   # 静态资源
├── Pictures/                 # 示例图片
├── CLAUDE.md                 # AI 辅助文档
└── README.md
```

## API 成本参考

| 服务 | 模型 | 单次调用 |
|------|------|---------|
| 人脸分析 | Doubao-seed-2.0-mini | ~0.01元 |
| 发型生成 | Seedream 5.0 Lite | ~0.25元/张 |

## License

MIT
