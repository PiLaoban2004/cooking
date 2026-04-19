# 寻味 · Cookbook App

Vue 3 + Vite + Vant + Cloudflare Pages Functions + D1 SQLite

## 部署前置步骤（第一次）

### 1. 创建 D1 数据库

```bash
npx wrangler d1 create cookbook-db
```

复制输出的 `database_id`，填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding       = "DB"
database_name = "cookbook-db"
database_id   = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   # ← 填这里
```

### 2. 初始化数据库表

```bash
# 远程（生产）
npx wrangler d1 execute cookbook-db --file=db/schema.sql

# 本地开发
npx wrangler d1 execute cookbook-db --local --file=db/schema.sql
```

### 3. Cloudflare Pages 构建设置

| 项目 | 值 |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION = 20` |

---

## 本地开发（带 API）

需要同时启动 Vite 和 wrangler：

```bash
# 终端 1：Pages Functions + D1（本地）
npx wrangler pages dev dist --d1=DB=cookbook-db --port=8788

# 终端 2：Vite dev server（代理 /api/* → 8788）
npm run dev
```

打开 http://localhost:5173 即可，API 自动代理到 wrangler。

### 仅看前端（不需要 API）

```bash
npm run dev
# 自建菜谱功能会报错，但 mock 数据浏览、路由、样式全部正常
```

---

## API 路由

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/recipes` | 获取所有自建菜谱（支持 `?category=` `?q=`） |
| POST | `/api/recipes` | 新建菜谱 |
| GET | `/api/recipes/:id` | 获取单条 |
| PUT | `/api/recipes/:id` | 更新 |
| DELETE | `/api/recipes/:id` | 删除 |

---

## 目录结构

```
frontend/
├── db/
│   └── schema.sql              # D1 建表语句
├── functions/
│   └── api/
│       ├── _middleware.js      # CORS 中间件
│       ├── recipes/
│       │   ├── index.js        # GET list / POST create
│       │   └── [id].js         # GET / PUT / DELETE 单条
├── public/
│   ├── _redirects              # SPA fallback
│   └── _headers                # 缓存 + 安全头
├── src/
│   ├── lib/
│   │   └── api.js              # fetch 封装
│   ├── stores/
│   │   ├── recipe.js           # CRUD 走 API
│   │   └── user.js             # 登录 / 收藏（localStorage）
│   └── views/ ...
├── wrangler.toml               # D1 binding 配置
└── vite.config.js              # 含 /api 代理
```
