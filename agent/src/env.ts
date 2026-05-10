import 'dotenv/config'

function require(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

export const env = {
  TELEGRAM_BOT_TOKEN: require('TELEGRAM_BOT_TOKEN'),
  OPENAI_API_KEY: require('OPENAI_API_KEY'),
  SUPABASE_URL: require('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: require('SUPABASE_SERVICE_ROLE_KEY'),
} as const
