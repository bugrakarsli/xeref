"use client";
import { useDesignStore } from "@/store/design-store";
import { PrototypePanelContent } from "@/components/design/panels/prototype-panel";
import { SlideDeckPanelContent } from "@/components/design/panels/slide-deck-panel";
import { TemplatePanelContent } from "@/components/design/panels/template-panel";
import { OtherPanelContent } from "@/components/design/panels/other-panel";

export function LauncherPanel() {
  const activeTab = useDesignStore((s) => s.activeTab);
  return (
    <div className="p-4">
      {activeTab === "prototype" && <PrototypePanelContent />}
      {activeTab === "slide_deck" && <SlideDeckPanelContent />}
      {activeTab === "template" && <TemplatePanelContent />}
      {activeTab === "other" && <OtherPanelContent />}
    </div>
  );
}
