
export type SidebarTab = 'chat' | 'tasks' | 'code'
export type ViewKey = 'home' | 'tasks' | 'stats' | 'calendar' | 'workflows' | 'inbox' | 'chat' | 'settings' | 'referral' | 'agents' | 'code' | 'customize' | 'code_session' | 'code_routines'

export type CategoryId = 'connect' | 'listen' | 'archive' | 'wire' | 'sense' | 'agent-architecture';

// Database entities
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  selected_feature_ids: string[];
  prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageEvent {
  id: string;
  user_id: string;
  event_type: 'prompt_generated' | 'project_saved' | 'project_loaded' | 'project_deleted';
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class e.g. "bg-blue-500"
}

export type FeatureDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Feature {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  difficulty: FeatureDifficulty;
  icon: string; // Lucide icon name
  tags: string[];
  requiredKeys: string[];
  prompt: string;
  dependencies?: string[]; // Optional: npm packages needed
}

// Chat entities
export interface Chat {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  title: string;
  url?: string;
  snippet: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  content: string;
  source: 'chat' | 'manual';
  tags: string[];
  created_at: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  trigger: string;
  trigger_description: string | null;
  action: string;
  enabled: boolean;
  cron_expression: string | null;
  webhook_secret: string | null;
  last_run_at: string | null;
  last_run_result: string | null;
  created_at: string;
}

export interface ChatAttachment {
  url: string;
  contentType: string;
  name: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  updated_at: string;
  created_at: string;
}

export interface DailyTarget {
  goal: number;
  completed: number;
  resetAt: string;
}

export interface ProjectGoal {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

// ── Artifact entities ─────────────────────────────────────────────────────────
// 'code' ViewKey currently maps to the Artifacts view.
// A future dedicated code-editor view can be added as a new ViewKey (e.g. 'code-editor') without conflict.

export type ArtifactType = 'code' | 'document' | 'image' | 'data' | 'prompt' | 'workflow'

export type ArtifactStatus = 'draft' | 'published' | 'error' | 'processing'

export type ArtifactCapability = 'ai-powered' | 'mcp-enabled' | 'storage-enabled'

export type ArtifactFilterType = ArtifactType | 'all'

export interface ArtifactVersion {
  version: number;
  content: string;
  createdAt: string;
  label?: string;
  language?: string;
}

export interface Artifact {
  id: string;
  title: string;
  description: string;
  type: ArtifactType;
  status: ArtifactStatus;
  capabilities: ArtifactCapability[];
  versions: ArtifactVersion[];
  currentVersion: number; // 0-based index into versions[]
  published: boolean;
  shareUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  language?: string;
}
