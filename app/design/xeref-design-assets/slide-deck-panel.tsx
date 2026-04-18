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
