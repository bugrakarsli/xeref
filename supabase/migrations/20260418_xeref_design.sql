-- Xeref Design: Feature schema
-- Run in Supabase SQL editor or via: supabase db push
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  logo_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members can read their org" ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- 2. Org members
CREATE TABLE IF NOT EXISTS org_members (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role               TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  job_roles          TEXT[] NOT NULL DEFAULT '{}',
  tutorial_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can read own membership" ON org_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admins manage members" ON org_members FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id=auth.uid() AND role IN ('owner','admin')));

-- 3. Design systems
CREATE TABLE IF NOT EXISTS design_systems (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  description        TEXT,
  brand_colors       JSONB,
  typography         JSONB,
  component_patterns JSONB,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_by         UUID NOT NULL REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_design_systems_org ON design_systems(org_id);
ALTER TABLE design_systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read design systems" ON design_systems FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id=auth.uid()));
CREATE POLICY "admins manage design systems" ON design_systems FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id=auth.uid() AND role IN ('owner','admin')));

-- 4. Project templates
CREATE TABLE IF NOT EXISTS project_templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  project_type  TEXT NOT NULL CHECK (project_type IN ('prototype','slide_deck','template','other')),
  thumbnail_url TEXT,
  config        JSONB NOT NULL DEFAULT '{}',
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_templates_org ON project_templates(org_id);
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read templates" ON project_templates FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id=auth.uid()));
CREATE POLICY "admins manage templates" ON project_templates FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id=auth.uid() AND role IN ('owner','admin')));

-- 5. Design projects (renamed from 'projects' to avoid collision with existing xeref projects table)
CREATE TABLE IF NOT EXISTS design_projects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id          UUID NOT NULL REFERENCES auth.users(id),
  name              TEXT NOT NULL,
  project_type      TEXT NOT NULL CHECK (project_type IN ('prototype','slide_deck','template','other')),
  prototype_mode    TEXT CHECK (prototype_mode IN ('wireframe','high_fidelity')),
  use_speaker_notes BOOLEAN NOT NULL DEFAULT FALSE,
  template_id       UUID REFERENCES project_templates(id) ON DELETE SET NULL,
  design_system_id  UUID REFERENCES design_systems(id) ON DELETE SET NULL,
  visibility        TEXT NOT NULL DEFAULT 'org' CHECK (visibility IN ('org','private','public')),
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  thumbnail_url     TEXT,
  meta              JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_design_projects_org    ON design_projects(org_id);
CREATE INDEX IF NOT EXISTS idx_design_projects_owner  ON design_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_design_projects_status ON design_projects(status);
ALTER TABLE design_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own design projects" ON design_projects FOR SELECT USING (owner_id=auth.uid());
CREATE POLICY "org members read org-visible design projects" ON design_projects FOR SELECT
  USING (visibility='org' AND org_id IN (SELECT org_id FROM org_members WHERE user_id=auth.uid()));
CREATE POLICY "users insert own design projects" ON design_projects FOR INSERT WITH CHECK (owner_id=auth.uid());
CREATE POLICY "users update own design projects" ON design_projects FOR UPDATE USING (owner_id=auth.uid());
CREATE POLICY "users delete own design projects" ON design_projects FOR DELETE USING (owner_id=auth.uid());

-- 6. Auto-update trigger (create only if it doesn't exist)
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_design_systems_updated BEFORE UPDATE ON design_systems FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON project_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_design_projects_updated BEFORE UPDATE ON design_projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
