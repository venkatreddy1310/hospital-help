import 'dotenv/config'

const DEFAULT_PORT = 4000

function parsePort(value: string | undefined): number {
  if (value === undefined || value.trim() === '') return DEFAULT_PORT
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535 (received "${value}").`)
  }
  return port
}

const nodeEnv = process.env.NODE_ENV ?? 'development'

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite'
const DEFAULT_GEMINI_TIMEOUT_MS = 25_000

function readOptional(value: string | undefined): string {
  return (value ?? '').trim()
}

function parseTimeout(value: string | undefined): number {
  if (value === undefined || value.trim() === '') return DEFAULT_GEMINI_TIMEOUT_MS
  const timeout = Number(value)
  if (!Number.isInteger(timeout) || timeout < 1_000 || timeout > 300_000) {
    throw new Error(
      `GEMINI_TIMEOUT_MS must be an integer between 1000 and 300000 (received "${value}").`,
    )
  }
  return timeout
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: parsePort(process.env.PORT),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
  // Optional: the demo runs without Gemini credentials and falls back offline.
  geminiApiKey: readOptional(process.env.GEMINI_API_KEY),
  geminiModel: readOptional(process.env.GEMINI_MODEL) || DEFAULT_GEMINI_MODEL,
  geminiTimeoutMs: parseTimeout(process.env.GEMINI_TIMEOUT_MS),
  supabaseUrl: readOptional(process.env.SUPABASE_URL),
  supabaseAnonKey:
    readOptional(process.env.SUPABASE_ANON_KEY) ||
    readOptional(process.env.SUPABASE_PUBLISHABLE_KEY),
} as const
