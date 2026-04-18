
import os

BASE = os.path.expanduser("~/xeref-design-app")
files = {}

# ── globals.css ────────────────────────────────────────────────────────────────
files["src/app/globals.css"] = """\
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg:#f6f4ef; --surface:#ffffff; --surface-soft:#fbfaf7;
  --surface-muted:#f1ece6; --border:#d9d2ca; --border-strong:#c9c0b6;
  --text:#201d18; --muted:#6f6a63; --faint:#948c83;
  --accent:#d97757; --accent-hover:#c96545; --accent-soft:#efb6a6;
  --shadow:0 10px 24px rgba(45,31,18,0.08);
  --shadow-soft:0 2px 10px rgba(45,31,18,0.05);
  --radius-lg:18px; --radius-md:12px; --radius-sm:10px;
}
*,*::before,*::after{box-sizing:border-box;}
html,body{margin:0;padding:0;height:100%;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:6px;}
.skip-link{position:absolute;top:-48px;left:16px;background:var(--text);color:white;padding:10px 14px;border-radius:10px;z-index:100;font-size:0.875rem;}
.skip-link:focus{top:16px;}
"""

# ── app/layout.tsx ─────────────────────────────────────────────────────────────
files["src/app/layout.tsx"] = '''\
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xeref Design",
  description: "Create branded designs, prototypes, and slide decks — powered by XerefAI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
'''

# ── app/design/page.tsx ────────────────────────────────────────────────────────
files["src/app/design/page.tsx"] = '''\
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
'''

# ── API routes ─────────────────────────────────────────────────────────────────
files["src/app/api/projects/route.ts"] = '''\
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CreateProjectInput } from "@/types";

async function getOrgMember(supabase: Awaited<ReturnType<typeof createServerSupabase>>, userId: string) {
  return supabase.from("org_members").select("org_id,role").eq("user_id", userId).single();
}

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: member } = await getOrgMember(supabase, user.id);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await supabase.from("projects").select("*").eq("org_id", member.org_id).order("updated_at",{ascending:false});
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: member } = await getOrgMember(supabase, user.id);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body: CreateProjectInput = await req.json();
  const { data, error } = await supabase.from("projects").insert({ ...body, org_id: member.org_id, owner_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
'''

files["src/app/api/design-systems/route.ts"] = '''\
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CreateDesignSystemInput } from "@/types";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: m } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await supabase.from("design_systems").select("*").eq("org_id", m.org_id).order("created_at",{ascending:false});
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: m } = await supabase.from("org_members").select("org_id,role").eq("user_id", user.id).single();
  if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["owner","admin"].includes(m.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body: CreateDesignSystemInput = await req.json();
  const { data, error } = await supabase.from("design_systems").insert({ ...body, org_id: m.org_id, created_by: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
'''

files["src/app/api/templates/route.ts"] = '''\
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CreateTemplateInput } from "@/types";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: m } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await supabase.from("project_templates").select("*").eq("org_id", m.org_id).order("created_at",{ascending:false});
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: m } = await supabase.from("org_members").select("org_id,role").eq("user_id", user.id).single();
  if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["owner","admin"].includes(m.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body: CreateTemplateInput = await req.json();
  const { data, error } = await supabase.from("project_templates").insert({ ...body, org_id: m.org_id, created_by: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
'''

for rel_path, content in files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

print(f"Written {len(files)} app + API files")
