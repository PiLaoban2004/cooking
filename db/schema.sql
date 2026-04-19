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
