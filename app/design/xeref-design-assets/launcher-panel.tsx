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
