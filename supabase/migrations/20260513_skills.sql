-- ─── Skills table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  endpoint_url TEXT,
  tools        TEXT[] DEFAULT '{}',
  source       TEXT NOT NULL DEFAULT 'user'
                 CHECK (source IN ('built-in', 'user')),
  user_id      UUID  -- NULL for built-in skills
);

-- Add columns idempotently if table already existed
ALTER TABLE skills ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'user'
  CHECK (source IN ('built-in', 'user'));
ALTER TABLE skills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE skills ADD COLUMN IF NOT EXISTS endpoint_url TEXT;

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "built-in skills visible to all" ON skills;
DROP POLICY IF EXISTS "users see own skills"           ON skills;
DROP POLICY IF EXISTS "users insert own skills"        ON skills;
DROP POLICY IF EXISTS "users update own skills"        ON skills;
DROP POLICY IF EXISTS "users delete own skills"        ON skills;

-- Built-in: every authenticated user can read
CREATE POLICY "built-in skills visible to all" ON skills
  FOR SELECT USING (source = 'built-in');

-- User-owned: only the owner can read / write
CREATE POLICY "users see own skills" ON skills
  FOR SELECT USING (source = 'user' AND auth.uid() = user_id);

CREATE POLICY "users insert own skills" ON skills
  FOR INSERT WITH CHECK (source = 'user' AND auth.uid() = user_id);

CREATE POLICY "users update own skills" ON skills
  FOR UPDATE USING (source = 'user' AND auth.uid() = user_id);

CREATE POLICY "users delete own skills" ON skills
  FOR DELETE USING (source = 'user' AND auth.uid() = user_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_skills_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_skills_updated_at ON skills;
CREATE TRIGGER trg_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE PROCEDURE update_skills_updated_at();

-- ─── Seed built-in skill-creator ─────────────────────────────────────────────
-- Remove any stale manual rows first
DELETE FROM skills WHERE name = 'skill-creator';

INSERT INTO skills (id, name, description, endpoint_url, tools, source, user_id)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'skill-creator',
  'A built-in skill for creating and managing agent skills. Provides templates, file scaffolding, and best-practice guidance for building new Xeref skills.',
  'https://xeref.ai/code',
  ARRAY['read_file','write_file','run_code','query_db'],
  'built-in',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name         = EXCLUDED.name,
  description  = EXCLUDED.description,
  endpoint_url = EXCLUDED.endpoint_url,
  tools        = EXCLUDED.tools,
  source       = EXCLUDED.source,
  user_id      = EXCLUDED.user_id;
