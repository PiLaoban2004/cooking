# task.md — 身份/接单/家庭成员/注册 实施任务清单

> 基于分析文档 v1 的方案落地。已确认决策见 §1。

## 1. 决策记录（已确认）

| # | 议题 | 决策 |
|---|---|---|
| 1 | 身份语义 | **方案 A**：身份是账号属性，注册时选定。徽章只展示，不可点切。要换身份 = 退登 → 重新注册账号 |
| 2 | 登录策略 | **严格模式**：未注册的用户名直接拒绝登录，提示"请先注册" |
| 3 | 订单状态机 | **三态**：`pending`（待接单）→ `accepted`（备菜中）→ `completed`（已完成） |
| 4 | 家庭成员存储 | **接 D1**：新建 `family_members` 表 + `/api/family` 路由。不走 localStorage |
| 5 | 厨师视角点菜页 | **前者**：Order.vue 厨师分支渲染"待接单收件箱 + 大按钮"，不是跳转去 Menu |

---

## 2. 数据模型变更

### 2.1 D1 Schema 增量（`db/schema.sql` 追加）

```sql
-- 用户表（mock 注册用，密码用明文 SHA-256 hash 存储；演示项目不做强加密）
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,                -- 'u_<timestamp>_<rand>'
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,                   -- sha256 hex
  role        TEXT NOT NULL CHECK (role IN ('cook','family')),
  avatar      TEXT,
  bio         TEXT DEFAULT '热爱生活，热爱美食',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 家庭成员表（每个用户维护自己的家庭成员名册）
CREATE TABLE IF NOT EXISTS family_members (
  id          TEXT PRIMARY KEY,                -- 'fm_<timestamp>_<rand>'
  owner_id    TEXT NOT NULL,                   -- 创建者 user.id
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('cook','family')),
  avatar      TEXT,
  note        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_family_owner ON family_members(owner_id);

-- 订单（meal plans）持久化表
CREATE TABLE IF NOT EXISTS meal_plans (
  id          TEXT PRIMARY KEY,                -- 'mp_<timestamp>'
  orderer_id  TEXT NOT NULL,                   -- 下单的家人 user.id
  cook_name   TEXT NOT NULL,                   -- 接单方姓名（暂存名字，不强制 FK）
  date        TEXT NOT NULL,                   -- ISO date YYYY-MM-DD
  meal        TEXT NOT NULL,                   -- breakfast/lunch/dinner
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','completed')),
  items       TEXT NOT NULL DEFAULT '[]',      -- JSON: [{recipeId,qty,note,title,cover,time,difficulty}]
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mp_orderer ON meal_plans(orderer_id);
CREATE INDEX IF NOT EXISTS idx_mp_cook    ON meal_plans(cook_name);
CREATE INDEX IF NOT EXISTS idx_mp_status  ON meal_plans(status);
CREATE INDEX IF NOT EXISTS idx_mp_date    ON meal_plans(date DESC);
```

### 2.2 迁移执行
- 远程：`wrangler d1 execute cookbook-db --remote --file=db/schema.sql`
- 本地：`wrangler d1 execute cookbook-db --local --file=db/schema.sql`

---

## 3. 后端任务（Cloudflare Pages Functions）

### 3.1 新建 `functions/api/auth/register.js`
- POST：body = `{ username, password, role }`
- 校验：用户名 1-20 字、密码 ≥4 位、role 必须是 `cook|family`
- 查重：`SELECT 1 FROM users WHERE username = ?` 命中 → 409
- 密码做 SHA-256（用 `crypto.subtle.digest`）
- 插入 users，返回 `{ ok:true, data: { id, username, role, avatar, bio } }`（不返回密码）

### 3.2 新建 `functions/api/auth/login.js`
- POST：body = `{ username, password }`
- 查 `SELECT * FROM users WHERE username = ?`
  - 不存在 → `{ ok:false, code:'NOT_REGISTERED', message:'请先注册' }` 状态 404
  - 密码不匹配 → `{ ok:false, message:'用户名或密码错误' }` 状态 401
- 返回同 register 的 data 结构

### 3.3 新建 `functions/api/family/index.js`
- GET `?owner=u_xxx` → 列出某用户的家庭成员
- POST → 新增成员，body `{ ownerId, name, role, avatar?, note? }`

### 3.4 新建 `functions/api/family/[id].js`
- DELETE → 删除成员
- PUT → 更新成员（name/role/note/avatar）

### 3.5 新建 `functions/api/meal-plans/index.js`
- GET `?orderer=xxx` 或 `?cook=xxx` 或 `?status=pending` → 列出订单
- POST → 创建订单，body 见 §2.1 表结构

### 3.6 新建 `functions/api/meal-plans/[id].js`
- PATCH → 改状态，body `{ status: 'accepted'|'completed' }`
- DELETE → 删订单（可选，先不实现）

### 3.7 工具函数
所有 functions 共用的 `json()` `parseJSON()` 已在 recipes 里定义，复制即可。考虑提一个 `functions/_lib/utils.js`？**不提**，保持当前每个文件自包含的风格。

---

## 4. 前端任务

### 4.1 stores 层

#### `src/stores/user.js` 改造
- user 对象新增 `role: 'cook'|'family'`
- 新增 `register(username, password, role)` → `POST /api/auth/register`
- `login()` 改为 `POST /api/auth/login`（不再 mock 通过）
- 新增 `isCook = computed(() => user.value?.role === 'cook')`
- 新增 `isFamily = computed(() => user.value?.role === 'family')`
- 保留 favorites 逻辑不动
- 错误处理：register/login 返回 `{ success, message, code? }`，UI 端按 code 走（如 `NOT_REGISTERED` 提示去注册）

#### `src/stores/mealPlan.js` 改造
- 移除内存 `plans`，改为通过 API 拉取
- 新增 `fetchPlans({ ordererId?, cookName?, status? })`
- `addPlan` 改为 `async createPlan(plan)` → `POST /api/meal-plans`，成功后塞进本地 plans
- 新增 `setStatus(planId, status)` → `PATCH /api/meal-plans/:id`，乐观更新
- 加载策略：进入 Menu 或 Order(厨师) 时调 `fetchPlans`

#### `src/stores/family.js`（新建）
```js
state: members[]
actions: fetchMembers(ownerId), addMember(payload), removeMember(id), updateMember(id, payload)
getters: cooks (filter role==='cook')
```
首次 fetch 若返回空且当前用户是 family，可以静默插入两个默认成员（`爸爸/cook`、`妈妈/cook`）— 但这逻辑放前端做就行，不写进后端。

### 4.2 视图层

#### `src/views/Login.vue` 改造
- 加 mode 切换 tab：`登录 / 注册`
- 注册模式额外字段：身份选择（两张大卡，二选一）
  - `👨‍🍳 厨师` — "做饭的人，给家人接单"
  - `👨 家人` — "点菜的人，给厨师下单"
- 注册成功 → 自动调 login → redirect
- 登录返回 `NOT_REGISTERED` → toast "请先注册" 并自动切到注册 tab，username 保留
- 已登录态菜单（`.menu`）追加一项 `🧑‍🤝‍🧑 家庭成员` → `/family`
- 已登录态头像下方加身份徽章 `· 厨师` 或 `· 家人`

#### `src/views/Order.vue` 改造
3 个分支按优先级：
1. `!userStore.isLoggedIn` → 渲染登录引导卡片（标题 + 副标题 + 主按钮跳 `/login?redirect=/order`）
2. `userStore.isCook` → 渲染 `<CookInbox />`（见 4.3）
3. 否则 → 现有的 today/browse/slot 子 tab
- 顶部徽章 `order-top__role` 根据角色显示文字 + emoji，不再写死

#### `src/views/Menu.vue` 改造
- 状态徽章颜色三态：
  - pending → 琥珀（`$color-warning`）
  - accepted → 主色橙（`$color-primary`）
  - completed → 草绿（`$color-success`）
- 卡片右下角加按钮区（仅厨师可见 `v-if="userStore.isCook"`）：
  - status=pending → `[接单]` → `setStatus(p.id, 'accepted')`
  - status=accepted → `[标记完成]` → `setStatus(p.id, 'completed')`
  - status=completed → 不渲染
- 按钮点击需 `e.stopPropagation()`，避免触发卡片点开详情
- 顶部 `menu-role-card` 文案根据身份切换：厨师"查看家人点的菜" / 家人"查看你点过的菜"

#### `src/views/Family.vue`（新建）
- 顶部 header：`家庭成员` + 副标题 + 右上 `[+ 添加]` 按钮
- 列表：每个成员一张卡（DiceBear 头像 + 名字 + 角色徽章 + 备注 + 删除小按钮）
- 添加 sheet（`<teleport to="body">`）：
  - 字段：名字（必填）/ 身份（cook/family 两选一）/ 备注（可选）
  - 提交 → `familyStore.addMember`
- 空态：`还没有家庭成员，加一个吧`
- 路由 meta `requiresAuth: true`

### 4.3 组件层

#### `src/components/order/CookInbox.vue`（新建）
- 顶部分段：`待接单 (N) | 备菜中 (M) | 已完成`，默认选中"待接单"
- 列表：`mealPlanStore.plans.filter(p => p.status === activeStatus && p.cookName === userStore.user.username)`
- 每张卡片放大版（不像 Menu 的紧凑版）：
  - 顶部：日期 + 餐时 + 下单人
  - 中间：菜品图墙（最多 6 张）+ 菜名列表
  - 底部大按钮：
    - pending → `[接 单]` 全宽主色按钮
    - accepted → `[标 记 完 成]` 草绿按钮
    - completed → 灰色禁用 `已完成 ✓`
- 空态文案分状态：
  - pending 空 → "暂无新订单 🍳"
  - accepted 空 → "没有备菜中的订单"
  - completed 空 → "还没有完成的订单"

#### `src/components/CartSheet.vue` 改造
- `targetOptions` 不再写死 `['爸爸','妈妈']`
- 改为 `computed(() => familyStore.cooks.map(m => m.name))`
- 进入 sheet 时若 `familyStore.members.length === 0` 触发一次 `fetchMembers`
- 提交时把 `cookName` 换成选中成员名字（已经是这样了，但要确保 family 列表先加载）

### 4.4 应用层

#### `src/App.vue` 改造
- `showCart` 加上 `&& !userStore.isCook` —— 厨师不显示购物车球
- 在 `onMounted` 里，若已登录，调 `familyStore.fetchMembers(user.id)` 预热

#### `src/router/index.js` 改造
- 新增 `/family` 路由 → `Family.vue`，meta `{ title: '家庭成员', requiresAuth: true }`

---

## 5. 实施顺序

按依赖顺序执行，每步都可独立验证：

### Step 1 · 数据库与后端（先把地基打好）
- [ ] 1.1 更新 `db/schema.sql`，加 users / family_members / meal_plans 三张表
- [ ] 1.2 远程 + 本地执行 schema 迁移
- [ ] 1.3 写 `functions/api/auth/register.js`
- [ ] 1.4 写 `functions/api/auth/login.js`
- [ ] 1.5 写 `functions/api/family/index.js` + `[id].js`
- [ ] 1.6 写 `functions/api/meal-plans/index.js` + `[id].js`
- [ ] 1.7 用 curl 验证 6 个端点都能跑通
  - 注册一个 cook 账号 + 一个 family 账号
  - 用 family 账号下一单，cook 账号 PATCH 改成 accepted、再改成 completed
  - 给 family 账号加两个家庭成员（爸爸=cook、妈妈=cook）

### Step 2 · 前端 store 接入
- [ ] 2.1 `stores/user.js` 加 register、改 login、加 isCook/isFamily
- [ ] 2.2 `stores/family.js` 新建
- [ ] 2.3 `stores/mealPlan.js` 改为 API 驱动 + 加 setStatus

### Step 3 · 注册 + 登录 UI
- [ ] 3.1 `Login.vue` 加 tab、加身份选择卡片、接 register
- [ ] 3.2 登录失败 NOT_REGISTERED 时自动切到注册 tab
- [ ] 3.3 已登录态加身份徽章

### Step 4 · 点菜门槛
- [ ] 4.1 `Order.vue` 加未登录引导卡片分支

### Step 5 · 厨师视图
- [ ] 5.1 新建 `components/order/CookInbox.vue`
- [ ] 5.2 `Order.vue` 加 isCook 分支
- [ ] 5.3 `Menu.vue` 加状态三态颜色 + 厨师可见按钮
- [ ] 5.4 `App.vue` 厨师隐藏 CartBall

### Step 6 · 家庭成员
- [ ] 6.1 `views/Family.vue` 新建
- [ ] 6.2 `router/index.js` 加 /family 路由
- [ ] 6.3 `Login.vue` 已登录菜单加入口
- [ ] 6.4 `CartSheet.vue` 接 familyStore

### Step 7 · 联调与回归
- [ ] 7.1 注册一个家人账号 → 添加家庭成员（爸爸-cook）→ 点菜 → 发送给爸爸
- [ ] 7.2 退登 → 用爸爸的账号注册（cook 身份）→ Order 页看到待接单 → 接单 → 完成
- [ ] 7.3 切回家人账号 → Menu 看到状态变化为 completed
- [ ] 7.4 刷新页面，订单仍在（D1 持久化生效）

---

## 6. 验收清单

### 功能
- [ ] 未注册用户用未存在的用户名登录 → 提示"请先注册"并自动切到注册 tab
- [ ] 注册时不选身份 → 不能提交
- [ ] 用户名重复注册 → 提示"用户名已被使用"
- [ ] 厨师账号进入 `/order` → 看到 CookInbox（不是 today/browse/slot 子 tab）
- [ ] 厨师账号底部不显示购物车球
- [ ] 家人账号点菜 → 发送给厨师 → Menu 出现 pending 状态卡片
- [ ] 厨师账号在 CookInbox 看到该订单 → 点接单 → 状态变 accepted
- [ ] 厨师在 accepted tab 看到订单 → 点标记完成 → 状态变 completed
- [ ] 家人账号刷新页面 → 订单状态保持 completed（D1 持久化）
- [ ] 家人账号"我的"页能进入 `/family` → 增删改成员
- [ ] CartSheet 的"发给"选项随家庭成员动态变化（只显示 role=cook 的）

### 视觉
- [ ] 三种状态徽章颜色清晰可分（琥珀/橙/绿）
- [ ] 注册页身份卡片选中态有明显视觉反馈
- [ ] CookInbox 大按钮触感明确（active 缩放 + 颜色变化）

### 边界
- [ ] 未登录用户访问 `/family` → 路由守卫踢回登录
- [ ] 家庭成员列表为空时 CartSheet 提交按钮兜底（可以提示"请先添加家庭成员"或不可用）
- [ ] mealPlans API 报错时 Menu 页有 fallback（不至于白屏）

---

## 7. 不在本次范围

- 真实密码加密（bcrypt 等）— 演示项目用 SHA-256 即可
- session/JWT — 用户身份靠前端 localStorage 的 user.id 携带在请求里
- 多用户隔离的菜谱 — 现有 recipes 表已有 `user_id` 字段但暂不强校验
- 推送通知（厨师收到订单时）
- 订单备注、口味偏好等扩展字段
- 家庭成员之间的关系图（爸爸/妈妈/孩子等亲属关系）

---

## 8. 风险点

| 风险 | 影响 | 缓解 |
|---|---|---|
| 本地 D1 schema 迁移失败 | 后端跑不起来 | 迁移前 `rm -rf .wrangler/state/v3/d1` 重置本地数据库再 import recipe seed |
| 远程 schema 迁移影响生产 | 数据丢失 | 三张新表都用 `CREATE TABLE IF NOT EXISTS`，不动 recipes 表 |
| login 严格模式让原演示账号都不能登 | 已有 localStorage user 的账号失效 | App 启动时检测：localStorage 有 user 但缺 role → 清空 user 强制重新注册 |
| family 成员名字和 cook 账号 username 不一致 | 订单 cookName 关联不上 | UI 提示"添加家庭成员时，名字最好与对方注册的用户名一致"。后续可加成员→账号绑定 |
| SHA-256 在 Workers 里没问题但前端也要算 | 双端不一致 | 统一在后端算，前端发明文。HTTPS 下可接受（演示项目） |

---

_最后更新：2026-04-25 · 待你 review 后开干_
