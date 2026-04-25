-- ============================================
-- Cookbook App · D1 Schema
-- 运行方式（在 Cloudflare Dashboard 或 wrangler）：
--   wrangler d1 execute cookbook-db --file=db/schema.sql
-- ============================================

CREATE TABLE IF NOT EXISTS recipes (
  id          TEXT PRIMARY KEY,          -- 'custom_xxx'
  title       TEXT NOT NULL,
  subtitle    TEXT,
  cover       TEXT,
  category    TEXT NOT NULL DEFAULT 'meat',
  author      TEXT NOT NULL DEFAULT '我',
  time        INTEGER NOT NULL DEFAULT 30,
  servings    INTEGER NOT NULL DEFAULT 2,
  difficulty  TEXT NOT NULL DEFAULT '简单',
  description TEXT,
  tags        TEXT NOT NULL DEFAULT '[]',       -- JSON array
  ingredients TEXT NOT NULL DEFAULT '[]',       -- JSON array
  steps       TEXT NOT NULL DEFAULT '[]',       -- JSON array
  likes       INTEGER NOT NULL DEFAULT 0,
  is_custom   INTEGER NOT NULL DEFAULT 1,       -- 1 = true
  user_id     TEXT,                             -- 预留用户归属
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_recipes_category   ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id    ON recipes(user_id);

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,                -- 'u_<timestamp>_<rand>'
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,                   -- SHA-256 hex（演示项目）
  role        TEXT NOT NULL CHECK (role IN ('cook','family')),
  avatar      TEXT,
  bio         TEXT DEFAULT '热爱生活，热爱美食',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- 家庭成员表
-- ============================================
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

-- ============================================
-- 订单（meal plans）持久化表
-- ============================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id          TEXT PRIMARY KEY,                -- 'mp_<timestamp>'
  orderer_id  TEXT NOT NULL,                   -- 下单的家人 user.id
  cook_name   TEXT NOT NULL,                   -- 接单方姓名
  date        TEXT NOT NULL,                   -- ISO date YYYY-MM-DD
  meal        TEXT NOT NULL,                   -- breakfast/lunch/dinner
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','completed')),
  items       TEXT NOT NULL DEFAULT '[]',      -- JSON array
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mp_orderer ON meal_plans(orderer_id);
CREATE INDEX IF NOT EXISTS idx_mp_cook    ON meal_plans(cook_name);
CREATE INDEX IF NOT EXISTS idx_mp_status  ON meal_plans(status);
CREATE INDEX IF NOT EXISTS idx_mp_date    ON meal_plans(date DESC);
