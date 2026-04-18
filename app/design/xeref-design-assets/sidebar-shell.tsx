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
