
import os

BASE = os.path.expanduser("~/xeref-design-app")

src_files = {}

# ── types/index.ts ─────────────────────────────────────────────────────────────
src_files["src/types/index.ts"] = '''\
export type ProjectType = "prototype" | "slide_deck" | "template" | "other";
export type PrototypeMode = "wireframe" | "high_fidelity";
export type OrgRole = "design"|"engineering"|"product"|"sales"|"data"|"marketing"|"other";

export interface Organization {
  id:string; name:string; slug:string; logo_url:string|null;
  created_at:string; updated_at:string;
}
export interface OrgMember {
  id:string; org_id:string; user_id:string;
  role:"owner"|"admin"|"member"; job_roles:OrgRole[];
  tutorial_completed:boolean; created_at:string;
}
export interface DesignSystem {
  id:string; org_id:string; name:string; description:string|null;
  brand_colors:Record<string,string>|null; typography:Record<string,string>|null;
  component_patterns:Record<string,unknown>|null; is_active:boolean;
  created_by:string; created_at:string; updated_at:string;
}
export interface ProjectTemplate {
  id:string; org_id:string; name:string; description:string|null;
  project_type:ProjectType; thumbnail_url:string|null;
  config:Record<string,unknown>; created_by:string;
  created_at:string; updated_at:string;
}
export interface Project {
  id:string; org_id:string; owner_id:string; name:string;
  project_type:ProjectType; prototype_mode:PrototypeMode|null;
  use_speaker_notes:boolean; template_id:string|null;
  design_system_id:string|null; visibility:"org"|"private"|"public";
  status:"draft"|"active"|"archived"; thumbnail_url:string|null;
  meta:Record<string,unknown>; created_at:string; updated_at:string;
}
export type CreateProjectInput = Pick<Project,"name"|"project_type"|"prototype_mode"|"use_speaker_notes"|"template_id"|"design_system_id"|"visibility">;
export type CreateDesignSystemInput = Pick<DesignSystem,"name"|"description"|"brand_colors"|"typography"|"component_patterns">;
export type CreateTemplateInput = Pick<ProjectTemplate,"name"|"description"|"project_type"|"config">;
export interface ApiSuccess<T> { data:T; error:null; }
export interface ApiError { data:null; error:string; }
export type ApiResponse<T> = ApiSuccess<T>|ApiError;
'''

# ── lib/utils.ts ───────────────────────────────────────────────────────────────
src_files["src/lib/utils.ts"] = '''\
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
'''

# ── lib/supabase/client.ts ─────────────────────────────────────────────────────
src_files["src/lib/supabase/client.ts"] = '''\
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
'''

# ── lib/supabase/server.ts ─────────────────────────────────────────────────────
src_files["src/lib/supabase/server.ts"] = '''\
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) {
          try { c.forEach(({name,value,options})=>cookieStore.set(name,value,options)); }
          catch {}
        },
      },
    }
  );
}
'''

# ── lib/supabase/middleware.ts ─────────────────────────────────────────────────
src_files["src/lib/supabase/middleware.ts"] = '''\
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(c) {
          c.forEach(({name,value})=>request.cookies.set(name,value));
          supabaseResponse = NextResponse.next({ request });
          c.forEach(({name,value,options})=>supabaseResponse.cookies.set(name,value,options));
        },
      },
    }
  );
  await supabase.auth.getUser();
  return supabaseResponse;
}
'''

# ── middleware.ts ──────────────────────────────────────────────────────────────
src_files["src/middleware.ts"] = '''\
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
export async function middleware(request: NextRequest) {
  return updateSession(request);
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
'''

# ── store/design-store.ts ──────────────────────────────────────────────────────
src_files["src/store/design-store.ts"] = '''\
import { create } from "zustand";
import type { ProjectType, PrototypeMode, OrgRole } from "@/types";

type SidebarTab = ProjectType;
type ModalId = "tutorial"|"createDesignSystem"|"createProject"|"none";
type MainTab = "recent"|"your_designs"|"examples"|"design_systems";

interface State {
  // Launcher
  activeTab: SidebarTab;
  prototypeName: string; prototypeMode: PrototypeMode;
  slideDeckName: string; useSpeakerNotes: boolean;
  templateName: string; selectedTemplateId: string|null;
  otherName: string;
  // Modals
  openModal: ModalId; tutorialRoles: OrgRole[];
  // Account menu
  accountMenuOpen: boolean;
  // Main tab
  mainTab: MainTab;
}

interface Actions {
  setActiveTab:(t:SidebarTab)=>void;
  setPrototypeName:(v:string)=>void; setPrototypeMode:(v:PrototypeMode)=>void;
  setSlideDeckName:(v:string)=>void; setUseSpeakerNotes:(v:boolean)=>void;
  setTemplateName:(v:string)=>void; setSelectedTemplateId:(v:string|null)=>void;
  setOtherName:(v:string)=>void; resetLauncher:()=>void;
  openTutorial:()=>void; openCreateDesignSystem:()=>void;
  openCreateProject:()=>void; closeModal:()=>void;
  toggleTutorialRole:(r:OrgRole)=>void; completeTutorial:()=>void;
  toggleAccountMenu:()=>void; closeAccountMenu:()=>void;
  setMainTab:(t:MainTab)=>void;
}

const defaults: State = {
  activeTab:"prototype", prototypeName:"", prototypeMode:"high_fidelity",
  slideDeckName:"", useSpeakerNotes:false, templateName:"",
  selectedTemplateId:null, otherName:"",
  openModal:"none", tutorialRoles:[],
  accountMenuOpen:false, mainTab:"design_systems",
};

export const useDesignStore = create<State & Actions>((set) => ({
  ...defaults,
  setActiveTab:(activeTab)=>set({activeTab}),
  setPrototypeName:(prototypeName)=>set({prototypeName}),
  setPrototypeMode:(prototypeMode)=>set({prototypeMode}),
  setSlideDeckName:(slideDeckName)=>set({slideDeckName}),
  setUseSpeakerNotes:(useSpeakerNotes)=>set({useSpeakerNotes}),
  setTemplateName:(templateName)=>set({templateName}),
  setSelectedTemplateId:(selectedTemplateId)=>set({selectedTemplateId}),
  setOtherName:(otherName)=>set({otherName}),
  resetLauncher:()=>set(defaults),
  openTutorial:()=>set({openModal:"tutorial"}),
  openCreateDesignSystem:()=>set({openModal:"createDesignSystem"}),
  openCreateProject:()=>set({openModal:"createProject"}),
  closeModal:()=>set({openModal:"none"}),
  toggleTutorialRole:(role)=>set((s)=>({
    tutorialRoles: s.tutorialRoles.includes(role)
      ? s.tutorialRoles.filter(r=>r!==role)
      : [...s.tutorialRoles, role],
  })),
  completeTutorial:()=>set({openModal:"none", tutorialRoles:[]}),
  toggleAccountMenu:()=>set((s)=>({accountMenuOpen:!s.accountMenuOpen})),
  closeAccountMenu:()=>set({accountMenuOpen:false}),
  setMainTab:(mainTab)=>set({mainTab}),
}));
'''

for rel_path, content in src_files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

print(f"Written {len(src_files)} src files")
