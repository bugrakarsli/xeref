import { createServerSupabase } from "@/lib/supabase/server";
import { SidebarShell } from "@/components/design/sidebar/sidebar-shell";
import { MainContent } from "@/components/design/layout/main-content";
import { ModalRoot } from "@/components/design/modals/modal-root";
import type { DesignSystem, ProjectTemplate } from "@/types";

export const dynamic = "force-dynamic";

export default async function DesignPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = user
    ? await supabase.from("org_members").select("org_id, organizations(name)").eq("user_id", user.id).single()
    : { data: null };

  const orgId = member?.org_id ?? null;
  const orgName = (member?.organizations as { name: string }|null)?.name ?? "your organization";

  const [dsResult, tplResult] = await Promise.all([
    orgId ? supabase.from("design_systems").select("*").eq("org_id", orgId).order("created_at",{ascending:false}) : { data: [] },
    orgId ? supabase.from("project_templates").select("*").eq("org_id", orgId).order("created_at",{ascending:false}) : { data: [] },
  ]);

  const designSystems = (dsResult.data ?? []) as DesignSystem[];
  const templates = (tplResult.data ?? []) as ProjectTemplate[];

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="w-[320px] shrink-0 h-full overflow-y-auto border-r border-border">
        <SidebarShell
          userName={user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User"}
          orgName={orgName}
        />
      </div>
      <MainContent orgName={orgName + "'s Organization"} designSystems={designSystems} templates={templates} />
      <ModalRoot />
    </div>
  );
}
