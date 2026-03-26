
export type ViewKey = 'home' | 'tasks' | 'stats' | 'calendar' | 'workflows' | 'inbox' | 'chats' | 'settings' | 'referral'

export type CategoryId = 'connect' | 'listen' | 'archive' | 'wire' | 'sense' | 'agent-architecture';

// Database entities
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  selected_feature_ids: string[];
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
