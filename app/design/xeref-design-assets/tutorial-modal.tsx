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
