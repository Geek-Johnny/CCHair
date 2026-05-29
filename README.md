# CCHair - AI 发型设计参考

> 上传人像照，AI 分析脸型五官，一键生成多款发型效果图  
> **v1.0** — 完成核心功能（分析/生成/历史/分享）

## 核心功能

1. **人像上传** — 拖拽或点击上传人像照片
2. **AI 人脸分析** — 可选 Doubao-seed-2.0-mini（火山方舟）或 Mimo-V2.5（DMXAPI）
3. **发型选择** — 三类方式挑选发型：
   - AI 推荐发型（分析结果自动推荐 3 款）
   - 热门发型预设（20 款男/女热门，悬浮看详细介绍）
   - 定制发型（长度/风格/类型/颜色单选 + 自定义输入）
4. **批量生成** — 多选后一键确认，批量生成效果图
5. **表格化展示** — 多款发型效果以网格排列，支持放大、下载和分享
6. **历史记录** — 分析结果和生成结果自动保存（IndexedDB），支持查看、恢复和删除
7. **批量操作** — 一键下载全部生成结果

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 人脸分析 | Doubao-seed-2.0-mini（火山方舟）/ Mimo-V2.5（DMXAPI） |
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
# 人脸分析 (Mimo-V2.5)，可选
DMXAPI_KEY=你的DMXAPI Key
DMXAPI_BASE_URL=https://www.dmxapi.cn/v1
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
│       ├── analyze/route.ts  # 人脸分析 API（双模型切换）
│       └── generate/route.ts # 发型生成 API
├── lib/
│   └── db.ts                 # IndexedDB 操作（历史记录 CRUD）
├── components/               # React 组件（9个）
├── types/                    # TypeScript 类型 + 发型/颜色数据
├── public/                   # 静态资源
├── Pictures/                 # 示例图片
├── CLAUDE.md                 # AI 辅助文档
└── README.md
```

## API 成本参考

| 服务 | 模型 | 单次调用 |
|------|------|---------|
| 人脸分析（火山方舟） | Doubao-seed-2.0-mini | ~0.01元 |
| 人脸分析（DMXAPI） | Mimo-V2.5 | ~0.016元（降价后 ~0.004元） |
| 发型生成 | Seedream 5.0 Lite | ~0.25元/张 |

## License

MIT
