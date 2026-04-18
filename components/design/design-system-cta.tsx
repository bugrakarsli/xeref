"use client";
import { useDesignStore } from "@/store/design-store";
import { Button } from "@/components/design/ui/button";

export function DesignSystemCta() {
  const openCreateDesignSystem = useDesignStore((s) => s.openCreateDesignSystem);
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-soft p-4">
      <p className="text-sm leading-relaxed mb-4">Create a design system so anyone can create good-looking designs and assets.</p>
      <Button variant="accent" fullWidth onClick={openCreateDesignSystem}>Set up design system</Button>
    </div>
  );
}
