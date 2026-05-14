
export type SidebarTab = 'chat' | 'tasks' | 'code'
export type ViewKey = 'home' | 'tasks' | 'stats' | 'calendar' | 'workflows' | 'inbox' | 'chat' | 'settings' | 'referral' | 'agents' | 'code' | 'customize' | 'code_session' | 'code_routines' | 'projects' | 'deploy' | 'memory' | 'classroom' | 'plans'

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

export interface CodeSession {
  id: string;
  user_id: string;
  title: string | null;
  repo_full_name: string | null;
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

export interface Course {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  duration_minutes: number | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
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

// ── User preferences (stored in profiles.preferences JSONB) ──────────────────

export interface SidebarPreferences {
  visible_tabs: string[];
  order: string[];
}

export interface CapabilitiesSettings {
  memory_search_enabled: boolean;
  memory_generate_from_history: boolean;
  import_from_other_ai: boolean;
  tool_access_mode: 'load_tools_when_needed' | 'ask_before_using_tools' | 'never_use_tools';
  connector_discovery_enabled: boolean;
  visuals_artifacts_enabled: boolean;
  visuals_inline_charts_enabled: boolean;
  code_execution_enabled: boolean;
  network_egress_enabled: boolean;
  domain_allowlist_mode: 'none' | 'package_managers_only' | 'all_domains';
  additional_allowed_domains: string[];
}

export interface XerefCodeAppearanceSettings {
  code_font: string | null;
}

export interface XerefCodeGeneralSettings {
  classify_session_states: boolean;
  auto_create_pull_requests: boolean;
  auto_fix_pull_requests: boolean;
}

export interface XerefCodeWebSettings {
  require_repo_access_for_shared_sessions: boolean;
  show_name_on_shared_sessions: boolean;
}

export interface UserPreferences {
  sidebar?: SidebarPreferences;
  capabilities?: Partial<CapabilitiesSettings>;
  xeref_code?: Partial<XerefCodeAppearanceSettings & XerefCodeGeneralSettings & XerefCodeWebSettings>;
}

export const DEFAULT_CAPABILITIES: CapabilitiesSettings = {
  memory_search_enabled: true,
  memory_generate_from_history: true,
  import_from_other_ai: false,
  tool_access_mode: 'load_tools_when_needed',
  connector_discovery_enabled: true,
  visuals_artifacts_enabled: true,
  visuals_inline_charts_enabled: true,
  code_execution_enabled: false,
  network_egress_enabled: false,
  domain_allowlist_mode: 'none',
  additional_allowed_domains: [],
}

// ── Execution Plan entities ───────────────────────────────────────────────────

export interface PlanTask {
  id: string;
  title: string;
  skill: string;
  description: string;
  role: string;
  timeline: string;
  deliverables: string;
}

export interface PlanPhase {
  id: string;
  title: string;
  subtitle: string;
  tasks: PlanTask[];
}

export interface PlanKpi {
  category: string;
  metrics: string[];
}

export interface PlanContent {
  phases: PlanPhase[];
  kpis: PlanKpi[];
}

export interface Plan {
  id: string;
  user_id: string;
  title: string;
  goal: string;
  content: PlanContent;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_XEREF_CODE: XerefCodeAppearanceSettings & XerefCodeGeneralSettings & XerefCodeWebSettings = {
  code_font: null,
  classify_session_states: true,
  auto_create_pull_requests: false,
  auto_fix_pull_requests: false,
  require_repo_access_for_shared_sessions: false,
  show_name_on_shared_sessions: true,
}
