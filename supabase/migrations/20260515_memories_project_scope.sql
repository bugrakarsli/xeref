-- Add project_id to memories so memories can be scoped to a project.
-- Existing rows get project_id = NULL (global / user-scoped).
ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS memories_project_id_idx ON public.memories (project_id)
  WHERE project_id IS NOT NULL;
