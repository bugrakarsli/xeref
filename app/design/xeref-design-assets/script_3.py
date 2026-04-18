
import os

BASE = os.path.expanduser("~/xeref-design-app")
files = {}

# ── UI primitives ──────────────────────────────────────────────────────────────
files["src/components/design/ui/button.tsx"] = '''\
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary"|"accent"|"ghost"|"dark"|"outline";
type Size = "sm"|"md"|"lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; fullWidth?: boolean;
}

const V: Record<Variant,string> = {
  primary: "bg-accent-soft text-white hover:bg-accent-hover active:scale-[0.98]",
  accent:  "bg-accent text-white hover:bg-accent-hover active:scale-[0.98]",
  ghost:   "bg-transparent text-muted hover:bg-surface-muted",
  dark:    "bg-[#171913] text-white hover:bg-black/90",
  outline: "border border-border bg-surface-soft text-text hover:bg-surface-muted",
};
const S: Record<Size,string> = {
  sm:"px-4 py-2 text-sm rounded-xl",
  md:"px-4 py-3 text-sm rounded-xl",
  lg:"px-5 py-3.5 text-base rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className,variant="primary",size="md",fullWidth=false,children,...props},ref) => (
    <button ref={ref}
      className={cn("inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",V[variant],S[size],fullWidth&&"w-full",className)}
      {...props}>{children}</button>
  )
);
Button.displayName = "Button";
'''

files["src/components/design/ui/badge.tsx"] = '''\
import { cn } from "@/lib/utils";
export function Badge({children,className}:{children:React.ReactNode;className?:string}) {
  return <span className={cn("inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border border-border bg-surface-soft text-muted",className)}>{children}</span>;
}
'''

files["src/components/design/ui/input.tsx"] = '''\
import * as React from "react";
import { cn } from "@/lib/utils";
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const Input = React.forwardRef<HTMLInputElement,InputProps>(({className,...props},ref)=>(
  <input ref={ref} className={cn("w-full rounded-xl border border-border bg-surface-soft px-3.5 py-3 text-sm text-text placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-colors duration-150",className)} {...props} />
));
Input.displayName = "Input";
'''

# ── Modals ─────────────────────────────────────────────────────────────────────
files["src/components/design/modals/modal-root.tsx"] = '''\
"use client";
import { useDesignStore } from "@/store/design-store";
import { TutorialModal } from "./tutorial-modal";
import { CreateDesignSystemModal } from "./create-design-system-modal";
export function ModalRoot() {
  const openModal = useDesignStore(s=>s.openModal);
  return (<><TutorialModal open={openModal==="tutorial"}/><CreateDesignSystemModal open={openModal==="createDesignSystem"}/></>);
}
'''

files["src/components/design/modals/tutorial-modal.tsx"] = '''\
"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDesignStore } from "@/store/design-store";
import { Button } from "@/components/design/ui/button";
import type { OrgRole } from "@/types";

const ROLES:{id:OrgRole;label:string}[] = [
  {id:"design",label:"Design"},{id:"engineering",label:"Engineering"},
  {id:"product",label:"Product"},{id:"sales",label:"Sales"},
  {id:"data",label:"Data"},{id:"marketing",label:"Marketing"},{id:"other",label:"Other"},
];

export function TutorialModal({open}:{open:boolean}) {
  const {closeModal,tutorialRoles,toggleTutorialRole,completeTutorial} = useDesignStore();
  return (
    <Dialog.Root open={open} onOpenChange={v=>!v&&closeModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"/>
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none">
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface border border-border shadow-card p-6">
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-muted text-muted flex items-center justify-center hover:bg-border transition-colors" aria-label="Close tutorial"><X size={16}/></button>
            </Dialog.Close>
            <Dialog.Title className="text-3xl font-extrabold tracking-tight mb-1">What do you do?</Dialog.Title>
            <Dialog.Description className="text-muted text-sm mb-6">Pick all that apply — we&apos;ll tailor tips to your workflow.</Dialog.Description>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {ROLES.map(({id,label})=>(
                <button key={id} onClick={()=>toggleTutorialRole(id)}
                  className={cn("min-h-[64px] rounded-xl border px-4 py-4 text-left font-semibold text-sm transition-all",
                    tutorialRoles.includes(id)?"border-accent bg-[#fff4f0] text-text":"border-border bg-surface-soft text-text hover:border-border-strong")}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={closeModal}>Skip</Button>
              <Button variant="dark" className="min-w-[120px]" onClick={completeTutorial}>Continue</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
'''

files["src/components/design/modals/create-design-system-modal.tsx"] = '''\
"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { useDesignStore } from "@/store/design-store";
import { Button } from "@/components/design/ui/button";
import { Input } from "@/components/design/ui/input";

export function CreateDesignSystemModal({open}:{open:boolean}) {
  const closeModal = useDesignStore(s=>s.closeModal);
  const [name,setName] = useState("");
  const [desc,setDesc] = useState("");
  const [loading,setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/design-systems",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,description:desc})});
      if (!res.ok) throw new Error("Failed");
      closeModal(); setName(""); setDesc("");
    } finally { setLoading(false); }
  }

  return (
    <Dialog.Root open={open} onOpenChange={v=>!v&&closeModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"/>
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-card p-6">
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-muted text-muted flex items-center justify-center hover:bg-border" aria-label="Close"><X size={16}/></button>
            </Dialog.Close>
            <Dialog.Title className="text-2xl font-extrabold tracking-tight mb-1">New design system</Dialog.Title>
            <Dialog.Description className="text-muted text-sm mb-6">Teach Xeref your brand&apos;s colors, typography, and component patterns.</Dialog.Description>
            <div className="space-y-4 mb-6">
              <div><label className="block text-sm font-medium mb-1.5" htmlFor="ds-name">System name</label><Input id="ds-name" placeholder="e.g. Xeref Brand System" value={name} onChange={e=>setName(e.target.value)}/></div>
              <div><label className="block text-sm font-medium mb-1.5" htmlFor="ds-desc">Description <span className="text-faint">(optional)</span></label><Input id="ds-desc" placeholder="What products or teams does this cover?" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button variant="accent" disabled={!name.trim()||loading} onClick={handleCreate}>{loading?"Creating…":"Create system"}</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
'''

for rel_path, content in files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

print(f"Written {len(files)} UI + modal files")
