# CCHair 部署指南

## 部署到 Vercel

### 1. 准备 GitHub 仓库

```bash
cd /Users/apple/AI/Projects/CCHair
git add .
git commit -m "feat: Phase 6.1 Freemium system"
git remote add origin https://github.com/你的用户名/CCHair.git
git push -u origin main
```

### 2. 在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New Project"
3. 选择 GitHub 仓库 `CCHair`
4. 框架自动检测为 Next.js
5. 点击 "Deploy"

### 3. 配置环境变量

在 Vercel 项目设置 → Environment Variables 中添加：

```
ARK_API_KEY=你的火山方舟API Key
ARK_API_KEY_ANALYZE=你的火山方舟API Key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DMXAPI_KEY=你的DMXAPI Key（可选）
DMXAPI_BASE_URL=https://www.dmxapi.cn/v1
```

### 4. 绑定域名

1. 在 Vercel 项目 → Settings → Domains
2. 输入 `aiheaven.top`
3. 记录 Vercel 提供的 DNS 记录：
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com

4. 在 NameSilo 配置 DNS：
   - 登录 NameSilo → Domain Manager → aiheaven.top
   - 点击 DNS 图标
   - 添加 A Record: Host=@, Target=76.76.21.21
   - 添加 CNAME Record: Host=www, Target=cname.vercel-dns.com

5. 等待 DNS 生效（通常 5-30 分钟）

### 5. 验证部署

访问 https://aiheaven.top 确认：
- [ ] 页面正常加载
- [ ] 上传图片功能正常
- [ ] AI 分析功能正常
- [ ] 发型生成功能正常
- [ ] 额度系统正常（显示 3 次免费额度）

## 注意事项

### 数据持久化

Vercel 的 Serverless 函数没有持久化文件存储，`data/` 目录中的用户数据会在冷启动时丢失。

**解决方案**（按优先级）：

1. **接受限制**：用户数据不持久化，每次访问重新开始（简单但体验差）
2. **Vercel KV**：使用 Redis 存储（有免费额度，需配置）
3. **外部数据库**：Supabase/PlanetScale 等（推荐，有免费额度）
4. **边缘存储**：Vercel Edge Config（只读，不适合写入）

### 成本估算

| 项目 | 免费额度 | 超出费用 |
|------|---------|---------|
| Vercel Hobby | 100GB 带宽/月 | $20/100GB |
| Vercel Functions | 100GB-hrs/月 | $0.18/GB-hrs |
| 域名 | - | ~$10/年（已购） |

## 故障排查

### 构建失败

```bash
# 本地测试构建
npm run build

# 检查 Node.js 版本（需要 18+）
node -v
```

### API 错误

检查 Vercel 项目日志：
- Vercel Dashboard → Project → Logs
- 确认环境变量已正确配置

### 域名问题

- DNS 传播需要时间，等待 24 小时
- 使用 [dnschecker.org](https://dnschecker.org) 验证 DNS 记录
- 确认 NameSilo DNS 设置正确
