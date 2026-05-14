import type { ViewKey } from '@/lib/types'

export interface SidebarNavItemDef {
  id: string
  label: string
  icon: string       // Lucide icon name (all already imported in sidebar.tsx)
  viewKey?: ViewKey
  href?: string      // use router.push when set
  configurable: boolean // whether users can show/hide this item
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItemDef[] = [
  { id: 'projects',  label: 'Projects',  icon: 'FolderOpen',   viewKey: 'home',      configurable: true,  },
  { id: 'customize', label: 'Customize', icon: 'Settings',     viewKey: 'customize', configurable: true,  },
  { id: 'artifacts', label: 'Artifacts', icon: 'Box',          href: '/artifacts',   configurable: true,  },
  { id: 'design',    label: 'Design',    icon: 'Paintbrush',   href: '/design',      configurable: true,  },
  { id: 'inbox',     label: 'Inbox',     icon: 'Mail',         href: '/inbox',       configurable: true,  },
  { id: 'classroom', label: 'Classroom', icon: 'BookOpen',     viewKey: 'classroom', configurable: true,  },
  { id: 'memory',    label: 'Memory',    icon: 'Brain',        viewKey: 'memory',    configurable: true,  },
  { id: 'stats',     label: 'Stats',     icon: 'BarChart2',    viewKey: 'stats',     configurable: true,  },
  { id: 'calendar',  label: 'Calendar',  icon: 'CalendarDays', viewKey: 'calendar',  configurable: true,  },
  { id: 'workflows', label: 'Workflows', icon: 'GitFork',      viewKey: 'workflows', configurable: true,  },
  { id: 'agents',    label: 'Agents',    icon: 'BrainCircuit', viewKey: 'agents',    configurable: true,  },
  { id: 'referral',  label: 'Referral',  icon: 'Users',        viewKey: 'referral',  configurable: true,  },
  { id: 'plans',     label: 'Plans',     icon: 'Map',          viewKey: 'plans',     configurable: true,  },
]

export const DEFAULT_VISIBLE_IDS = ['projects', 'customize', 'artifacts', 'design', 'inbox']

export const ALL_ITEM_IDS = SIDEBAR_NAV_ITEMS.map(i => i.id)
