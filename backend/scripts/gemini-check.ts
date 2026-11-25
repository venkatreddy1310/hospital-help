/**
 * Safe backend-only Gemini connectivity check.
 *
 * Run with: npm run ai:check
 *
 * It never prints the API key. It reports:
 * - whether GEMINI_API_KEY is present (not its value),
 * - which Gemini text-generation models the key can see,
 * - the configured model and its HTTP status, error category and latency,
 * - a suggested working fallback model when the configured one is unsupported.
 */
import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import { env } from '../src/config/env.js'

const LIST_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const PROBE_TIMEOUT_MS = 20_000

type ModelCard = {
  name?: string
  displayName?: string
  supportedGenerationMethods?: string[]
}

function redact(value: string): string {
  const key = env.geminiApiKey
  return key.length > 0 ? value.split(key).join('<redacted>') : value
}

function categoryFor(error: unknown): string {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : null
  const message = error instanceof Error ? error.message.toLowerCase() : ''

  if (message.includes('abort')) return 'timeout'
  if (status === 400) return 'bad request (invalid config or model)'
  if (status === 401) return 'unauthorized (invalid API key)'
  if (status === 402) return 'payment required (billing)'
  if (status === 403) return 'permission denied (key restrictions or billing)'
  if (status === 404) return 'not found (unsupported model or endpoint)'
  if (status === 429) return 'quota or rate limit'
  if (status !== null && status >= 500) return 'Gemini service error'
  if (message.includes('fetch failed') || message.includes('enotfound')) return 'network error'
  return 'unknown error'
}

function statusOf(error: unknown): number | null {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = Number((error as { status?: unknown }).status)
    return Number.isFinite(status) ? status : null
  }
  return null
}

async function listModels(): Promise<ModelCard[]> {
  const response = await fetch(`${LIST_URL}?pageSize=1000`, {
    headers: { 'x-goog-api-key': env.geminiApiKey },
  })
  if (!response.ok) {
    throw Object.assign(new Error(`model listing failed with ${response.status}`), {
      status: response.status,
    })
  }
  const payload = (await response.json()) as { models?: ModelCard[] }
  return payload.models ?? []
}

async function probe(model: string): Promise<{
  ok: boolean
  status: number | null
  category: string
  latencyMs: number
  text?: string
}> {
  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  const started = Date.now()

  try {
    const response = await ai.models.generateContent({
      model,
      contents: 'Reply with exactly one word: pong',
      config: {
        temperature: 0,
        maxOutputTokens: 64,
        // Thinking tokens count against maxOutputTokens; MINIMAL keeps the
        // probe from returning an empty candidate on thinking models.
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        abortSignal: controller.signal,
      },
    })
    const text = response.text?.trim() ?? ''
    return {
      ok: text.length > 0,
      status: 200,
      category: text.length > 0 ? 'ok' : 'empty response (no text returned)',
      latencyMs: Date.now() - started,
      text,
    }
  } catch (error) {
    return {
      ok: false,
      status: statusOf(error),
      category: categoryFor(error),
      latencyMs: Date.now() - started,
    }
  } finally {
    clearTimeout(timer)
  }
}

async function main(): Promise<void> {
  console.log('Gemini backend diagnostic')
  console.log('GEMINI_API_KEY present:', env.geminiApiKey.length > 0)
  console.log('Configured model:', env.geminiModel)
  console.log('Configured timeout:', `${env.geminiTimeoutMs} ms`)

  if (env.geminiApiKey.length === 0) {
    console.log('Result: ai_not_configured — set GEMINI_API_KEY in backend/.env')
    process.exitCode = 1
    return
  }

  let models: ModelCard[] = []
  try {
    models = await listModels()
    const usable = models
      .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => (model.name ?? '').replace(/^models\//, ''))
      .filter((name) => name.startsWith('gemini'))
    console.log(`Models visible to this key (${usable.length} with generateContent):`)
    console.log(usable.join(', '))
  } catch (error) {
    console.log('Model listing failed:', statusOf(error), '—', categoryFor(error))
  }

  const configured = await probe(env.geminiModel)
  console.log(
    `Probe ${env.geminiModel}: status=${configured.status ?? 'n/a'} ` +
      `category=${configured.category} latency=${configured.latencyMs} ms`,
  )
  if (configured.ok) console.log('Reply:', configured.text ?? '(empty)')
  else console.log('Configured model is NOT usable.')

  if (!configured.ok) {
    const candidates = models
      .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => (model.name ?? '').replace(/^models\//, ''))
      .filter((name) => /flash/.test(name) && !/image|tts|live|audio|embedding/.test(name))
    for (const candidate of candidates) {
      if (candidate === env.geminiModel) continue
      const result = await probe(candidate)
      console.log(
        `Probe ${candidate}: status=${result.status ?? 'n/a'} ` +
          `category=${result.category} latency=${result.latencyMs} ms`,
      )
      if (result.ok) {
        console.log(`Suggested GEMINI_MODEL=${candidate}`)
        return
      }
    }
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.log('Diagnostic crashed:', categoryFor(error))
  const message = error instanceof Error ? redact(error.message) : 'unknown error'
  console.log(message)
  process.exitCode = 1
})
