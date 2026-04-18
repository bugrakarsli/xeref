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
