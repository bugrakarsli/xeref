-- ─── Artifacts table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artifacts (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  type            TEXT        NOT NULL DEFAULT 'document'
                    CHECK (type IN ('code','document','image','data','prompt','workflow')),
  status          TEXT        NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','published','error','processing')),
  capabilities    TEXT[]      NOT NULL DEFAULT '{}',
  versions        JSONB       NOT NULL DEFAULT '[]',
  current_version INTEGER     NOT NULL DEFAULT 0,
  published       BOOLEAN     NOT NULL DEFAULT false,
  share_url       TEXT,
  image_url       TEXT,
  language        TEXT,
  tags            TEXT[]      NOT NULL DEFAULT '{}'
);

-- Index for fast per-user queries (newest first)
CREATE INDEX IF NOT EXISTS artifacts_user_updated
  ON artifacts (user_id, updated_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users see own or published artifacts" ON artifacts;
DROP POLICY IF EXISTS "users insert own artifacts"           ON artifacts;
DROP POLICY IF EXISTS "users update own artifacts"           ON artifacts;
DROP POLICY IF EXISTS "users delete own artifacts"           ON artifacts;

-- Owners see all their artifacts; anyone can see published ones
CREATE POLICY "users see own or published artifacts" ON artifacts
  FOR SELECT USING (auth.uid() = user_id OR published = true);

CREATE POLICY "users insert own artifacts" ON artifacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own artifacts" ON artifacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users delete own artifacts" ON artifacts
  FOR DELETE USING (auth.uid() = user_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_artifacts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_artifacts_updated_at ON artifacts;
CREATE TRIGGER trg_artifacts_updated_at
  BEFORE UPDATE ON artifacts
  FOR EACH ROW EXECUTE PROCEDURE update_artifacts_updated_at();
