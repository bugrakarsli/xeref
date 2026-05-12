import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureOrgForUser } from "@/lib/design/ensure-org";
import type { CreateDesignProjectInput } from "@/types/design";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = await ensureOrgForUser(user).catch(() => null);
  if (!orgId) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("design_projects").select("*").eq("org_id", orgId).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = await ensureOrgForUser(user).catch(() => null);
  if (!orgId) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  const body: CreateDesignProjectInput = await req.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from("design_projects")
    .insert({ ...body, org_id: orgId, owner_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
