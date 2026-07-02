# ChatBarrage

实时弹幕 Web 应用，基于 React + Vite + Cloudflare Worker 构建。

## 功能特性

- 🎯 实时弹幕发送与展示
- 🎨 自定义弹幕颜色
- 🔤 自定义字号大小
- 👤 Dicebear 随机头像
- 🔒 敏感词过滤（JSON 配置）
- 💾 Cloudflare KV 存储 / localStorage 兜底
- 🛡️ 管理员面板（登录、删除、批量删除）
- 🌙 深色/浅色主题切换
- 📱 响应式设计（桌面/平板/手机）

## 快速开始

### 本地开发（localStorage 模式）

```bash
npm install
npm run dev
```

访问 http://localhost:5173

### 使用 Cloudflare Worker

```bash
npm install
npm run dev:worker
```

访问 http://localhost:8788

## 配置

### 存储配置

编辑 `src/config/app.ts`：

```typescript
storage: {
  type: 'local',  // 'local' 或 'kv'
}
```

### 管理员账号

本地开发：编辑 `.dev.vars`

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

生产环境：在 Cloudflare Dashboard 设置环境变量。

### Cloudflare KV

1. 在 Cloudflare Dashboard 创建 KV Namespace
2. 将 Namespace ID 填入 `wrangler.toml`
3. 部署：`npm run deploy`

### 敏感词

编辑 `src/config/sensitive-words.json`，添加需要过滤的词汇。

### 弹幕设置

编辑 `src/config/app.ts` 中的 `barrage` 配置项。

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 弹幕主页 |
| `/admin` | 管理员面板 |

## 技术栈

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- Lucide Icons
- Hono (Cloudflare Worker)

## 部署

```bash
npm run deploy
```

部署到 Cloudflare Pages，前端静态文件 + Worker API 一体化。
