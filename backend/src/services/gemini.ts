import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import { env } from '../config/env.js'
import type { AssistantRequestInput } from '../types/ai.js'
import { logger } from '../utils/logger.js'
import { redactPersonalData } from './pii.js'

const REQUEST_TIMEOUT_MS = env.geminiTimeoutMs
const MAX_GENERATION_ATTEMPTS = 2
const RETRY_BACKOFF_MS = 600

const SYSTEM_INSTRUCTION = `You are the MediPulse demo health assistant for users in India.
You explain health topics, medical terms, and sensible next steps in simple, calm language.

Hard safety rules (never break these):
1. Never diagnose a condition. Say what is commonly associated with symptoms and that a clinician decides.
2. Never prescribe medicines, dosages, or treatments. Never suggest stopping prescribed medicine.
3. Never claim to be a doctor or a substitute for professional care.
4. If the user describes an emergency (chest pain, severe bleeding, breathing difficulty, stroke signs, unconsciousness, seizure, severe allergic reaction, suicidal thoughts, pregnancy emergencies), tell them to call 112 or 108 in India immediately or go to the nearest emergency department. Do not delay care to keep chatting.
5. The rule-based triage result in the context is authoritative. Never downgrade it. If it says emergency or urgent, respect that.
6. Do not discuss insurance eligibility, cashless approval, network status, or claim outcomes. Tell the user to confirm with the hospital and the insurer/TPA.
7. Do not ask for or store full names, phone numbers, policy numbers, addresses, ID numbers, or other personal identifiers. If the user shares them, do not repeat them.
8. Do not provide legal, financial, or insurance advice.

Style:
- Be concise: at most about 180 words unless the user asks for more.
- Use short paragraphs or a short bullet list.
- Include when to seek care and which specialty may be relevant when useful.
- End with one or two practical next steps.
- Add a brief reminder that this is general education, not medical advice.`

export type AssistantFailureCode =
  | 'ai_not_configured'
  | 'ai_quota_exceeded'
  | 'ai_auth_failed'
  | 'ai_unavailable'
  | 'ai_blocked'

export type AssistantResult =
  | {
      ok: true
      reply: string
      model: string
      provider: 'gemini' | 'safety-triage'
      redactions: number
    }
  | {
      ok: false
      code: AssistantFailureCode
      message: string
      redactions: number
    }

export function isAiConfigured(): boolean {
  return env.geminiApiKey.length > 0
}

let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI | null {
  if (!isAiConfigured()) return null
  client ??= new GoogleGenAI({ apiKey: env.geminiApiKey })
  return client
}

const localeName: Record<AssistantRequestInput['locale'], string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
}

function buildPrompt(input: AssistantRequestInput, message: string): string {
  const context: string[] = [`Preferred language: ${localeName[input.locale]}.`]

  if (input.triageUrgency) {
    context.push(`Rule-based triage result: ${input.triageUrgency}.`)
  }
  if (input.specialty) {
    context.push(`Specialty linked to this conversation: ${input.specialty}.`)
  }

  return `${context.join('\n')}

User message (personal identifiers already removed):
"""
${message}
"""

Respond with helpful, plain-language health education following your safety rules.`
}

function emergencyReply(): AssistantResult {
  return {
    ok: true,
    reply: `This may be an emergency. Please call 112 or 108 in India now, or go to the nearest emergency department. Do not wait for this chat or try to manage a possible emergency at home.\n\nIf you can, stay with someone until help arrives. A triage result marked as an emergency should always be treated as urgent.`,
    model: 'safety-triage',
    provider: 'safety-triage',
    redactions: 0,
  }
}

function errorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null
  const record = error as Record<string, unknown>
  if (typeof record.status === 'number') return record.status
  const nested = record.error
  if (typeof nested === 'object' && nested !== null) {
    const inner = nested as Record<string, unknown>
    if (typeof inner.code === 'number') return inner.code
  }
  return null
}

function isTimeout(error: unknown): boolean {
  if (error instanceof Error && error.name === 'AbortError') return true
  const message = error instanceof Error ? error.message.toUpperCase() : ''
  return message.includes('ABORT') || message.includes('TIMEOUT')
}

function isTransientFailure(error: unknown): boolean {
  const status = errorStatus(error)
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true
  }
  if (isTimeout(error)) return false
  const message = error instanceof Error ? error.message.toUpperCase() : ''
  return (
    message.includes('FETCH FAILED') ||
    message.includes('ECONNRESET') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND') ||
    message.includes('NETWORK')
  )
}

function classifyFailure(error: unknown): Exclude<AssistantResult, { ok: true }> {
  const status = errorStatus(error)
  const rawMessage = error instanceof Error ? error.message.toUpperCase() : ''

  if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('QUOTA')) {
    logger.warn('Gemini assistant request failed: quota or rate limit reached')
    return {
      ok: false,
      code: 'ai_quota_exceeded',
      message:
        'The AI assistant is temporarily over its quota. The built-in offline guidance still works.',
      redactions: 0,
    }
  }

  if (
    status === 401 ||
    status === 402 ||
    status === 403 ||
    rawMessage.includes('API_KEY_INVALID') ||
    rawMessage.includes('API KEY NOT VALID') ||
    rawMessage.includes('PERMISSION_DENIED')
  ) {
    logger.warn('Gemini assistant request failed: credentials rejected or billing blocked')
    return {
      ok: false,
      code: 'ai_auth_failed',
      message:
        'The AI service credentials were rejected or billing is not enabled. The built-in offline guidance still works.',
      redactions: 0,
    }
  }

  if (status === 404) {
    logger.warn('Gemini assistant request failed: configured model unavailable')
    return {
      ok: false,
      code: 'ai_unavailable',
      message:
        'The configured AI model is unavailable for this key. Update GEMINI_MODEL or use the offline guidance.',
      redactions: 0,
    }
  }

  if (isTimeout(error)) {
    logger.warn('Gemini assistant request timed out')
    return {
      ok: false,
      code: 'ai_unavailable',
      message: 'The AI assistant took too long to respond. Please try again in a moment.',
      redactions: 0,
    }
  }

  if (
    rawMessage.includes('FETCH FAILED') ||
    rawMessage.includes('ECONNREFUSED') ||
    rawMessage.includes('ENOTFOUND')
  ) {
    logger.warn('Gemini assistant request failed: network error reaching Gemini')
    return {
      ok: false,
      code: 'ai_unavailable',
      message:
        'The AI assistant could not reach Gemini. Please try again, or use the offline guidance below.',
      redactions: 0,
    }
  }

  logger.warn('Gemini assistant request failed: service unavailable')
  return {
    ok: false,
    code: 'ai_unavailable',
    message:
      'The AI assistant is unavailable right now. Please try again, or use the offline guidance below.',
    redactions: 0,
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function requestReply(ai: GoogleGenAI, prompt: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.35,
        topP: 0.9,
        maxOutputTokens: 700,
        candidateCount: 1,
        // Gemini 3.x models spend time on internal reasoning by default; this
        // assistant only needs short educational answers.
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        abortSignal: controller.signal,
      },
    })

    return response.text?.trim() ?? ''
  } finally {
    clearTimeout(timer)
  }
}

export async function generateAssistantReply(
  input: AssistantRequestInput,
): Promise<AssistantResult> {
  if (input.triageUrgency === 'emergency') {
    // Deterministic safety path: never risk a slow or downgraded answer for a
    // rule-based emergency.
    return emergencyReply()
  }

  const ai = getClient()
  if (!ai) {
    return {
      ok: false,
      code: 'ai_not_configured',
      message:
        'The AI assistant is not configured on this server. You can still use the built-in offline guidance and the symptom triage.',
      redactions: 0,
    }
  }

  const { text, redactions } = redactPersonalData(input.message)
  const prompt = buildPrompt(input, text)
  let lastError: unknown = null

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      const reply = await requestReply(ai, prompt)
      if (!reply) {
        logger.warn('Gemini assistant returned no text (possibly blocked)')
        return {
          ok: false,
          code: 'ai_blocked',
          message:
            'The AI assistant could not answer that request. Please rephrase it, or use the symptom triage for next steps.',
          redactions,
        }
      }

      return {
        ok: true,
        reply,
        model: env.geminiModel,
        provider: 'gemini',
        redactions,
      }
    } catch (error) {
      lastError = error
      const canRetry =
        attempt < MAX_GENERATION_ATTEMPTS && isTransientFailure(error)
      if (!canRetry) break

      logger.warn(`Gemini assistant request failed on attempt ${attempt}; retrying once`)
      await delay(RETRY_BACKOFF_MS * attempt)
    }
  }

  const failure = classifyFailure(lastError)
  return { ...failure, redactions }
}
