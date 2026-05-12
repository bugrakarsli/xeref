-- Fix infinite recursion in org_members RLS policy.
--
-- The original "admins manage members" policy queried org_members from within
-- an org_members policy, causing Postgres to recurse infinitely.
-- Fix: use a SECURITY DEFINER function that bypasses RLS when checking membership.

CREATE OR REPLACE FUNCTION is_org_admin(check_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE user_id = auth.uid()
      AND org_id = check_org_id
      AND role IN ('owner', 'admin')
  );
$$;

-- Recreate the recursive policy using the safe function
DROP POLICY IF EXISTS "admins manage members" ON org_members;
CREATE POLICY "admins manage members" ON org_members FOR ALL
  USING (is_org_admin(org_id));

-- Also fix design_systems and project_templates policies which have the same pattern
DROP POLICY IF EXISTS "admins manage design systems" ON design_systems;
CREATE POLICY "admins manage design systems" ON design_systems FOR ALL
  USING (is_org_admin(org_id));

DROP POLICY IF EXISTS "admins manage templates" ON project_templates;
CREATE POLICY "admins manage templates" ON project_templates FOR ALL
  USING (is_org_admin(org_id));
