import { Feature, CategoryId } from './types';

export function generateMasterPrompt(selectedFeatures: Feature[]): string {
  // 1. Group features by category in CLAWS order
  const clawsOrder: CategoryId[] = ['connect', 'listen', 'archive', 'wire', 'sense', 'agent-architecture'];
  
  const groupedFeatures: Record<CategoryId, Feature[]> = {
    'connect': [],
    'listen': [],
    'archive': [],
    'wire': [],
    'sense': [],
    'agent-architecture': []
  };

  selectedFeatures.forEach(feature => {
    if (groupedFeatures[feature.category]) {
      groupedFeatures[feature.category].push(feature);
    }
  });

  // 2. Collect API Keys
  const allKeys = new Set<string>();
  selectedFeatures.forEach(f => {
    f.requiredKeys.forEach(k => allKeys.add(k));
  });
  const apiKeyList = Array.from(allKeys).join('\n');

  // 3. Build the prompt sections
  let featuresSection = '';

  clawsOrder.forEach(catId => {
    const features = groupedFeatures[catId];
    if (features.length > 0) {
      const categoryName = catId.charAt(0).toUpperCase() + catId.slice(1);
      featuresSection += `\n[Category: ${categoryName}]\n`;
      features.forEach(f => {
        featuresSection += `- ${f.name}: ${f.prompt.replace(/\n/g, '\n  ')}\n`;
      });
    }
  });

  // 4. Construct the full prompt
  return `You are an expert AI engineer working inside Google Antigravity.
Your task is to build a custom AI agent based on the open-source OpenClaw architecture.
The user has selected the following ${selectedFeatures.length} features to integrate.

Build each feature step-by-step in the CLAWS order:
C - Connect (messaging channels)
L - Listen (voice & media capabilities)
A - Archive (memory systems)
W - Wire (tools & MCP integrations)
S - Sense (proactive behaviors & scheduling)

For each feature:
1. Explain what you're about to build (1-2 sentences)
2. Create the necessary files and configurations
3. Ask for any required API keys before proceeding
4. Test and verify the feature works
5. Move to the next feature

SELECTED FEATURES:
━━━━━━━━━━━━━━━━${featuresSection}
━━━━━━━━━━━━━━━━

REQUIRED API KEYS:
${apiKeyList || '(None)'}

IMPORTANT RULES:
- Build features incrementally. Do not skip ahead.
- After each feature, confirm it works before moving on.
- If a feature fails, debug it before proceeding.
- Use Node.js and npm for all installations.
- Store sensitive keys in .env file.
- Keep all code local-first (no cloud dependencies unless explicitly chosen).
- Create an implementation-plan.md tracking all features and their status.`;
}
