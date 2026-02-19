
export type CategoryId = 'connect' | 'listen' | 'archive' | 'wire' | 'sense' | 'agent-architecture';

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
