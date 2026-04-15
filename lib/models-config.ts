export interface ModelOption {
    id: string;
    name: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
    { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'google/gemini-2.0-pro', name: 'Gemini 2.0 Pro' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'openai/o3-mini', name: 'O3 Mini' }
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;
