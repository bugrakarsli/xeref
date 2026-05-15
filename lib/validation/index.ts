import { z } from 'zod'

/**
 * Parses `body` against `schema`. Returns `{ data }` on success or
 * `{ error }` (a ready-to-return 400 Response) on failure.
 */
export function parseBody<T>(
  schema: z.ZodType<T>,
  body: unknown,
): { data: T; error?: never } | { data?: never; error: Response } {
  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      error: Response.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 },
      ),
    }
  }
  return { data: result.data }
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export const ChatBodySchema = z.object({
  // z.any() preserves AI SDK message type compatibility; non-empty array is the key invariant
  messages: z.array(z.any()).min(1),
  projectId: z.string().optional(),
  systemAgentId: z.string().optional(),
  model: z.string().max(100).optional(),
  webSearchEnabled: z.boolean().optional(),
  legacyMode: z.boolean().optional(),
})

// ── Telegram ─────────────────────────────────────────────────────────────────

export const TelegramRegisterSchema = z.object({
  token: z.string().regex(/^\d+:[A-Za-z0-9_-]+$/, 'Invalid Telegram bot token format'),
})

export const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    chat: z.object({ id: z.number() }),
    text: z.string().optional(),
    from: z.object({
      first_name: z.string().optional(),
      username: z.string().optional(),
    }).optional(),
  }).optional(),
})

// ── Webhooks ─────────────────────────────────────────────────────────────────

export const CreemEventSchema = z.object({
  eventType: z.string(),
})

export const WorkflowWebhookPayloadSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().max(50000).optional(),
})

// ── Memory / Documents ───────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/msword',
] as const

export const UploadUrlSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().positive().max(50 * 1024 * 1024),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  ocr: z.boolean().optional(),
})

export const FinalizeDocumentSchema = z.object({
  documentId: z.string().uuid(),
  ocr: z.boolean().optional(),
})

// ── Routines ─────────────────────────────────────────────────────────────────

export const CreateRoutineSchema = z.object({
  name: z.string().min(1).max(200),
  prompt: z.string().max(10000).optional(),
  model: z.string().max(100).optional(),
  repo_full_name: z.string().max(200).nullable().optional(),
  connectors: z.array(z.string().max(100)).optional(),
  schedule_cron: z.string().max(100).nullable().optional(),
  timezone: z.string().max(100).optional(),
})

// Whitelist of patchable fields — prevents raw passthrough to .update()
export const UpdateRoutineSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  prompt: z.string().max(10000).optional(),
  model: z.string().max(100).optional(),
  repo_full_name: z.string().max(200).nullable().optional(),
  connectors: z.array(z.string().max(100)).optional(),
  schedule_cron: z.string().max(100).nullable().optional(),
  timezone: z.string().max(100).optional(),
  active: z.boolean().optional(),
})

// ── Plans ────────────────────────────────────────────────────────────────────

export const CreatePlanSchema = z.object({
  goal: z.string().min(5).max(2000).trim(),
})

// ── Settings ─────────────────────────────────────────────────────────────────

export const UpdateGeneralSettingsSchema = z.object({
  display_name: z.string().max(80).optional(),
  avatar_url: z.string().max(2048).optional(),
})

export const UpdateCapabilitiesSchema = z.object({
  memory_search_enabled: z.boolean().optional(),
  memory_generate_from_history: z.boolean().optional(),
  import_from_other_ai: z.boolean().optional(),
  tool_access_mode: z.enum(['load_tools_when_needed', 'ask_before_using_tools', 'never_use_tools']).optional(),
  connector_discovery_enabled: z.boolean().optional(),
  visuals_artifacts_enabled: z.boolean().optional(),
  visuals_inline_charts_enabled: z.boolean().optional(),
  code_execution_enabled: z.boolean().optional(),
  network_egress_enabled: z.boolean().optional(),
  domain_allowlist_mode: z.enum(['none', 'package_managers_only', 'all_domains']).optional(),
  additional_allowed_domains: z.array(z.string().max(253)).optional(),
})

export const UpdateSidebarSchema = z.object({
  visible_tabs: z.array(z.string()).optional(),
  order: z.array(z.string()).optional(),
})
