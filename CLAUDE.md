# CCHair - AI 发型设计参考

## 项目概述
上传人像照，AI 分析脸型五官，生成多款发型效果图。

## 技术栈
- **框架**: Next.js 15 (App Router) + TypeScript
- **样式**: Tailwind CSS v4
- **人脸分析**: Doubao-seed-2.0-mini (火山方舟, Responses API)
- **图像生成**: Seedream 5.0 Lite (火山方舟, images/generations API)

## 目录结构
```
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面
│   ├── globals.css         # Tailwind 全局样式
│   └── api/
│       ├── analyze/route.ts    # 人脸分析 → Doubao-seed-2.0-mini (Responses API)
│       └── generate/route.ts   # 发型生成 → Seedream 5.0 Lite
├── components/
│   ├── header.tsx           # 顶部导航
│   ├── main-panel.tsx       # 主面板（状态管理中枢）
│   ├── upload-area.tsx      # 拖拽上传
│   ├── analysis-card.tsx    # 分析结果卡片（含骨架屏）
│   ├── hair-style-selector.tsx # 发型选择器（3维度15种）
│   ├── result-grid.tsx      # 结果网格
│   ├── result-card.tsx      # 单个结果（放大/下载）
│   └── index.ts             # 统一导出
├── types/
│   └── index.ts             # TypeScript 类型 + 发型分类数据
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
# 人脸分析 (Doubao-seed-2.0-mini)，可与生成共用同一 Key
ARK_API_KEY_ANALYZE=你的火山方舟API Key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
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
人脸分析，调用 Doubao-seed-2.0-mini（火山方舟 Responses API）。
```json
// Request: { "image": "base64编码的图片" }
// Response: { "analysis": { FaceAnalysis } }
```

### POST /api/generate
发型生成，调用 Seedream 5.0 Lite（火山方舟 images/generations API）。
```json
// Request: { "image": "base64编码的图片", "hairstyle": "发型描述(如齐肩短发)" }
// Response: { "image": "base64编码的结果图" }
```

## 成本参考
| 服务 | 模型 | 单次调用 |
|------|------|---------|
| 人脸分析 | Doubao-seed-2.0-mini | ~0.01元 |
| 发型生成 | Seedream 5.0 Lite | ~0.25元/张 |

## 项目状态
✅ 阶段 1-2：项目初始化 + 核心 UI 搭建
✅ 阶段 3：API 对接完成（Doubao-seed 分析 + Seedream 生成均已调通）
⬜ 阶段 4：交互体验优化（分享、批量下载等）
⬜ 阶段 5：历史记录（IndexedDB）
