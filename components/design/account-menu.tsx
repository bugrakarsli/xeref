"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDesignStore } from "@/store/design-store";

export function AccountMenu({ userName, orgName }: { userName: string; orgName: string }) {
  const { accountMenuOpen, toggleAccountMenu, closeAccountMenu, openTutorial } = useDesignStore();
  return (
    <DropdownMenu.Root open={accountMenuOpen} onOpenChange={(v) => !v && closeAccountMenu()}>
      <DropdownMenu.Trigger asChild>
        <button onClick={toggleAccountMenu} aria-expanded={accountMenuOpen}
          className="w-full flex items-center gap-2 flex-wrap rounded-full border border-border bg-surface-soft px-2.5 py-2 text-left hover:bg-surface-muted transition-colors">
          <span className="w-6 h-6 rounded-full border border-border bg-surface flex items-center justify-center text-xs font-bold flex-shrink-0">{userName[0].toUpperCase()}</span>
          <span className="text-sm font-medium truncate">{userName}</span>
          <span className="text-xs text-muted border border-border bg-surface px-2 py-0.5 rounded-full truncate max-w-[140px]">{orgName}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content side="top" align="start" sideOffset={8}
          className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] rounded-xl border border-border bg-surface shadow-[var(--shadow-card)] p-2 z-30">
          <div className="px-2 pb-2 mb-2 border-b border-border">
            <p className="text-xs uppercase tracking-widest text-faint mb-0.5">Signed in as</p>
            <p className="text-sm font-semibold">{userName}</p>
          </div>
          <DropdownMenu.Item onSelect={() => { openTutorial(); closeAccountMenu(); }}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-surface-soft outline-none">
            Tutorial
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-surface-soft outline-none">
            Organization settings
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t border-border" />
          <DropdownMenu.Item className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-surface-soft text-[#e07070] outline-none">
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
