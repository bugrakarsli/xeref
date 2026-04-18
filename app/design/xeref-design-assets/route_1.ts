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
