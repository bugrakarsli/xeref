
import os

BASE = os.path.expanduser("~/xeref-design-app")
files = {}

# ── Sidebar components ─────────────────────────────────────────────────────────
files["src/components/design/sidebar/sidebar-tabs.tsx"] = '''\
"use client";
import { useDesignStore } from "@/store/design-store";
import { cn } from "@/lib/utils";
import type { ProjectType } from "@/types";

const TABS:{id:ProjectType;label:string}[] = [
  {id:"prototype",label:"Prototype"},{id:"slide_deck",label:"Slide deck"},
  {id:"template",label:"From template"},{id:"other",label:"Other"},
];

export function SidebarTabs() {
  const {activeTab,setActiveTab} = useDesignStore();
  return (
    <div role="tablist" aria-label="Project types" className="grid grid-cols-4 border-b border-border bg-surface-soft rounded-t-2xl overflow-hidden">
      {TABS.map(({id,label})=>(
        <button key={id} role="tab" aria-selected={activeTab===id} onClick={()=>setActiveTab(id)}
          className={cn("py-3 px-2 text-xs font-semibold text-center transition-colors",activeTab===id?"bg-surface text-text":"text-muted hover:text-text")}>
          {label}
        </button>
      ))}
    </div>
  );
}
'''

files["src/components/design/sidebar/launcher-panel.tsx"] = '''\
"use client";
import { useDesignStore } from "@/store/design-store";
import { PrototypePanelContent } from "./panels/prototype-panel";
import { SlideDeckPanelContent } from "./panels/slide-deck-panel";
import { TemplatePanelContent } from "./panels/template-panel";
import { OtherPanelContent } from "./panels/other-panel";

export function LauncherPanel() {
  const activeTab = useDesignStore(s=>s.activeTab);
  return (
    <div className="p-4">
      {activeTab==="prototype" && <PrototypePanelContent/>}
      {activeTab==="slide_deck" && <SlideDeckPanelContent/>}
      {activeTab==="template" && <TemplatePanelContent/>}
      {activeTab==="other" && <OtherPanelContent/>}
    </div>
  );
}
'''

files["src/components/design/sidebar/panels/prototype-panel.tsx"] = '''\
"use client";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/design/ui/input";
import { Button } from "@/components/design/ui/button";
import { cn } from "@/lib/utils";
import type { PrototypeMode } from "@/types";

const MODES:{id:PrototypeMode;label:string;desc:string}[] = [
  {id:"wireframe",label:"Wireframe",desc:"Rough flows and ideas quickly"},
  {id:"high_fidelity",label:"High fidelity",desc:"Polished mockups with brand components"},
];

export function PrototypePanelContent() {
  const {prototypeName,setPrototypeName,prototypeMode,setPrototypeMode} = useDesignStore();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">New prototype</h2>
      <Input placeholder="Project name" value={prototypeName} onChange={e=>setPrototypeName(e.target.value)} aria-label="Prototype project name"/>
      <div className="grid grid-cols-2 gap-3">
        {MODES.map(({id,label,desc})=>(
          <button key={id} onClick={()=>setPrototypeMode(id)}
            className={cn("rounded-xl border p-2.5 text-left transition-all",prototypeMode===id?"border-[#77a3ff] shadow-[inset_0_0_0_1px_#77a3ff]":"border-border bg-surface-soft hover:border-border-strong")}>
            <div className="h-20 rounded-lg border border-dashed border-border bg-gradient-to-b from-[#f8f4ef] to-[#efe8df] mb-2"/>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted mt-0.5">{desc}</p>
          </button>
        ))}
      </div>
      <Button variant="primary" fullWidth disabled={!prototypeName.trim()}>Create</Button>
    </div>
  );
}
'''

files["src/components/design/sidebar/panels/slide-deck-panel.tsx"] = '''\
"use client";
import * as Switch from "@radix-ui/react-switch";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/design/ui/input";
import { Button } from "@/components/design/ui/button";

export function SlideDeckPanelContent() {
  const {slideDeckName,setSlideDeckName,useSpeakerNotes,setUseSpeakerNotes} = useDesignStore();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">New slide deck</h2>
      <Input placeholder="Project name" value={slideDeckName} onChange={e=>setSlideDeckName(e.target.value)} aria-label="Slide deck project name"/>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-soft px-3.5 py-3">
        <div><p className="text-sm font-semibold">Use speaker notes</p><p className="text-xs text-muted">Less text on slides</p></div>
        <Switch.Root checked={useSpeakerNotes} onCheckedChange={setUseSpeakerNotes} id="speaker-notes"
          className="w-12 h-6 rounded-full border border-border-strong bg-surface-muted data-[state=checked]:bg-accent transition-colors">
          <Switch.Thumb className="block w-5 h-5 rounded-full bg-white shadow translate-x-0.5 transition-transform data-[state=checked]:translate-x-[26px]"/>
        </Switch.Root>
      </div>
      <Button variant="primary" fullWidth disabled={!slideDeckName.trim()}>Create</Button>
    </div>
  );
}
'''

files["src/components/design/sidebar/panels/template-panel.tsx"] = '''\
"use client";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/design/ui/input";
import { Button } from "@/components/design/ui/button";
import { cn } from "@/lib/utils";

const BUILTIN = [{id:"animation",label:"Animation",desc:"Timeline-based motion design"}];

export function TemplatePanelContent() {
  const {templateName,setTemplateName,selectedTemplateId,setSelectedTemplateId} = useDesignStore();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">Start from a template</h2>
      <Input placeholder="Project name" value={templateName} onChange={e=>setTemplateName(e.target.value)} aria-label="Template project name"/>
      <div className="space-y-2">
        {BUILTIN.map(t=>(
          <button key={t.id} onClick={()=>setSelectedTemplateId(t.id)}
            className={cn("w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",selectedTemplateId===t.id?"border-accent bg-[#fff4f0]":"border-border bg-surface-soft hover:border-border-strong")}>
            <span className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0",selectedTemplateId===t.id?"border-accent bg-accent":"border-border")}/>
            <span><span className="block text-sm font-semibold">{t.label}</span><span className="block text-xs text-muted">{t.desc}</span></span>
          </button>
        ))}
      </div>
      <a className="block text-xs text-muted underline" href="#">How to create a template</a>
      <Button variant="primary" fullWidth disabled={!templateName.trim()||!selectedTemplateId}>Create from template</Button>
    </div>
  );
}
'''

files["src/components/design/sidebar/panels/other-panel.tsx"] = '''\
"use client";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/design/ui/input";
import { Button } from "@/components/design/ui/button";

export function OtherPanelContent() {
  const {otherName,setOtherName} = useDesignStore();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">New project</h2>
      <Input placeholder="Project name" value={otherName} onChange={e=>setOtherName(e.target.value)} aria-label="Other project name"/>
      <Button variant="primary" fullWidth disabled={!otherName.trim()}>Create</Button>
    </div>
  );
}
'''

files["src/components/design/sidebar/design-system-cta.tsx"] = '''\
"use client";
import { useDesignStore } from "@/store/design-store";
import { Button } from "@/components/design/ui/button";

export function DesignSystemCta() {
  const openCreateDesignSystem = useDesignStore(s=>s.openCreateDesignSystem);
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-soft p-4">
      <p className="text-sm leading-relaxed mb-4">Create a design system so anyone can create good-looking designs and assets.</p>
      <Button variant="accent" fullWidth onClick={openCreateDesignSystem}>Set up design system</Button>
    </div>
  );
}
'''

files["src/components/design/sidebar/account-menu.tsx"] = '''\
"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDesignStore } from "@/store/design-store";

export function AccountMenu({userName,orgName}:{userName:string;orgName:string}) {
  const {accountMenuOpen,toggleAccountMenu,closeAccountMenu,openTutorial} = useDesignStore();
  return (
    <DropdownMenu.Root open={accountMenuOpen} onOpenChange={v=>!v&&closeAccountMenu()}>
      <DropdownMenu.Trigger asChild>
        <button onClick={toggleAccountMenu} aria-expanded={accountMenuOpen}
          className="w-full flex items-center gap-2 flex-wrap rounded-full border border-border bg-surface-soft px-2.5 py-2 text-left hover:bg-surface-muted transition-colors">
          <span className="w-6 h-6 rounded-full border border-border bg-white flex items-center justify-center text-xs font-bold flex-shrink-0">{userName[0].toUpperCase()}</span>
          <span className="text-sm font-medium truncate">{userName}</span>
          <span className="text-xs text-muted border border-border bg-white px-2 py-0.5 rounded-full truncate max-w-[140px]">{orgName}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content side="top" align="start" sideOffset={8}
          className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] rounded-xl border border-border bg-surface shadow-card p-2 z-30">
          <div className="px-2 pb-2 mb-2 border-b border-border">
            <p className="text-xs uppercase tracking-widest text-faint mb-0.5">Signed in as</p>
            <p className="text-sm font-semibold">{userName}</p>
          </div>
          <DropdownMenu.Item onSelect={()=>{openTutorial();closeAccountMenu();}} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-surface-soft outline-none">Tutorial</DropdownMenu.Item>
          <DropdownMenu.Item className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-surface-soft outline-none">Organization settings</DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t border-border"/>
          <DropdownMenu.Item className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-surface-soft text-[#c9352a] outline-none">Sign out</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
'''

files["src/components/design/sidebar/sidebar-shell.tsx"] = '''\
import { SidebarTabs } from "./sidebar-tabs";
import { LauncherPanel } from "./launcher-panel";
import { DesignSystemCta } from "./design-system-cta";
import { AccountMenu } from "./account-menu";
import { Badge } from "@/components/design/ui/badge";

export function SidebarShell({userName,orgName}:{userName:string;orgName:string}) {
  return (
    <aside className="flex flex-col gap-4 border-r border-border p-6 h-full">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full border border-border-strong flex items-center justify-center shrink-0">
          <span className="text-accent font-black text-sm">X</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold tracking-tight leading-none">Xeref Design</h1>
            <Badge>Research Preview</Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">by XerefAI Labs</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-surface shadow-soft overflow-hidden">
        <SidebarTabs/><LauncherPanel/>
      </div>
      <p className="text-xs text-muted leading-snug px-1">Anyone in your organization with the link can view your project by default.</p>
      <DesignSystemCta/>
      <div className="flex-1"/>
      <AccountMenu userName={userName} orgName={orgName}/>
    </aside>
  );
}
'''

# ── Main content ───────────────────────────────────────────────────────────────
files["src/components/design/layout/main-content.tsx"] = '''\
"use client";
import { useDesignStore } from "@/store/design-store";
import { Button } from "@/components/design/ui/button";
import { cn } from "@/lib/utils";
import type { DesignSystem, ProjectTemplate } from "@/types";

type MainTab = "recent"|"your_designs"|"examples"|"design_systems";
const TABS:{id:MainTab;label:string}[] = [
  {id:"recent",label:"Recent"},{id:"your_designs",label:"Your designs"},
  {id:"examples",label:"Examples"},{id:"design_systems",label:"Design systems"},
];

export function MainContent({orgName,designSystems,templates}:{orgName:string;designSystems:DesignSystem[];templates:ProjectTemplate[]}) {
  const {mainTab,setMainTab,openCreateDesignSystem} = useDesignStore();
  return (
    <main className="flex-1 overflow-y-auto p-8" id="main-content">
      <nav className="flex gap-2 flex-wrap mb-8" aria-label="Sections">
        {TABS.map(({id,label})=>(
          <button key={id} onClick={()=>setMainTab(id)}
            className={cn("px-4 py-2.5 rounded-xl border font-semibold text-sm transition-colors",mainTab===id?"bg-surface border-border-strong text-text":"bg-surface-soft border-border text-muted hover:text-text")}>
            {label}
          </button>
        ))}
      </nav>

      {mainTab==="design_systems" && (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-1">Organization settings</h2>
            <p className="text-muted">Manage design systems and templates for everyone in {orgName}.</p>
          </div>

          <section className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Design systems</p>
            <div className="rounded-2xl border border-border bg-surface shadow-soft overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div><p className="font-semibold">Create new design system</p><p className="text-sm text-muted">Teach Xeref your brand and product.</p></div>
                <Button variant="accent" size="sm" onClick={openCreateDesignSystem}>Create</Button>
              </div>
              {designSystems.length>0 && (
                <ul className="border-t border-border divide-y divide-border">
                  {designSystems.map(ds=>(
                    <li key={ds.id} className="flex items-center justify-between px-5 py-4">
                      <div><p className="font-semibold text-sm">{ds.name}</p>{ds.description&&<p className="text-xs text-muted mt-0.5">{ds.description}</p>}</div>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",ds.is_active?"bg-green-100 text-green-700":"bg-surface-muted text-muted")}>{ds.is_active?"Active":"Inactive"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Templates</p>
            <div className="rounded-2xl border border-border bg-surface shadow-soft">
              {templates.length===0
                ? <div className="flex items-center justify-center min-h-24 px-6 py-8"><p className="text-muted text-sm text-center">No templates yet. Create one from any project via Share &rarr; File type.</p></div>
                : <ul className="divide-y divide-border">{templates.map(t=>(
                    <li key={t.id} className="flex items-center justify-between px-5 py-4">
                      <div><p className="font-semibold text-sm">{t.name}</p>{t.description&&<p className="text-xs text-muted mt-0.5">{t.description}</p>}</div>
                      <span className="text-xs text-muted border border-border rounded-full px-2 py-0.5">{t.project_type}</span>
                    </li>
                  ))}</ul>
              }
            </div>
          </section>
          <p className="text-xs text-muted">Everyone in your organization can view these settings.</p>
        </>
      )}
      {mainTab!=="design_systems" && (
        <div className="flex items-center justify-center h-64 text-muted text-sm">This view is coming in the next release.</div>
      )}
    </main>
  );
}
'''

# ── Hooks ──────────────────────────────────────────────────────────────────────
files["src/hooks/use-design-systems.ts"] = '''\
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DesignSystem } from "@/types";

export function useDesignSystems(orgId:string|null) {
  const [designSystems,setDesignSystems] = useState<DesignSystem[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);

  useEffect(()=>{
    if (!orgId) return;
    const supabase = createClient();
    async function fetch() {
      setLoading(true);
      const {data,error:err} = await supabase.from("design_systems").select("*").eq("org_id",orgId).order("created_at",{ascending:false});
      if (err) setError(err.message); else setDesignSystems(data??[]);
      setLoading(false);
    }
    fetch();
    const channel = supabase.channel("ds_"+orgId)
      .on("postgres_changes",{event:"*",schema:"public",table:"design_systems",filter:`org_id=eq.${orgId}`},()=>fetch())
      .subscribe();
    return ()=>{ supabase.removeChannel(channel); };
  },[orgId]);

  return {designSystems,loading,error};
}
'''

files["src/hooks/use-projects.ts"] = '''\
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";

export function useProjects(orgId:string|null) {
  const [projects,setProjects] = useState<Project[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  useEffect(()=>{
    if (!orgId) return;
    const supabase = createClient();
    supabase.from("projects").select("*").eq("org_id",orgId).order("updated_at",{ascending:false}).then(({data,error:err})=>{
      if (err) setError(err.message); else setProjects(data??[]);
      setLoading(false);
    });
  },[orgId]);
  return {projects,loading,error};
}
'''

files["src/hooks/use-templates.ts"] = '''\
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectTemplate } from "@/types";

export function useTemplates(orgId:string|null) {
  const [templates,setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  useEffect(()=>{
    if (!orgId) return;
    const supabase = createClient();
    supabase.from("project_templates").select("*").eq("org_id",orgId).order("created_at",{ascending:false}).then(({data,error:err})=>{
      if (err) setError(err.message); else setTemplates(data??[]);
      setLoading(false);
    });
  },[orgId]);
  return {templates,loading,error};
}
'''

for rel_path, content in files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

print(f"Written {len(files)} component + hook files")
