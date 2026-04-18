import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SidebarShell } from "@/components/design/sidebar-shell";
import { MainContent } from "@/components/design/main-content";
import { ModalRoot } from "@/components/design/modals/modal-root";
import type { DesignSystem, ProjectTemplate } from "@/types/design";

export const dynamic = "force-dynamic";

export default async function DesignPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, organizations(name)")
    .eq("user_id", user.id)
    .single();

  const orgId = member?.org_id ?? null;
  const orgsField = member?.organizations;
  const orgRecord = Array.isArray(orgsField) ? orgsField[0] : orgsField;
  const orgName = (orgRecord && typeof orgRecord === "object" && "name" in orgRecord)
    ? String(orgRecord.name)
    : "your organization";

  const [dsResult, tplResult] = await Promise.all([
    orgId
      ? supabase.from("design_systems").select("*").eq("org_id", orgId).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as DesignSystem[] }),
    orgId
      ? supabase.from("project_templates").select("*").eq("org_id", orgId).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as ProjectTemplate[] }),
  ]);

  const designSystems = (dsResult.data ?? []) as DesignSystem[];
  const templates = (tplResult.data ?? []) as ProjectTemplate[];

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="w-[320px] shrink-0 h-full overflow-y-auto border-r border-border">
        <SidebarShell
          userName={user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"}
          orgName={orgName}
        />
      </div>
      <MainContent
        orgName={orgId ? orgName + "'s Organization" : "your organization"}
        designSystems={designSystems}
        templates={templates}
      />
      <ModalRoot />
    </div>
  );
}
