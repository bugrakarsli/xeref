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
