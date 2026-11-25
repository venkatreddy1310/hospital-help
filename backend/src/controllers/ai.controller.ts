import type { Request, Response } from 'express'
import { HttpError } from '../middleware/errorHandler.js'
import { generateAssistantReply, isAiConfigured } from '../services/gemini.js'
import { env } from '../config/env.js'
import type {
  AiStatus,
  AssistantLocale,
  AssistantReply,
  AssistantRequestInput,
  TriageUrgency,
} from '../types/ai.js'
import { AI_DISCLAIMER, EMERGENCY_NUMBERS } from '../types/ai.js'
import type { ApiResponse } from '../types/api.js'

const locales: AssistantLocale[] = ['en', 'hi', 'te']
const urgencies: TriageUrgency[] = ['emergency', 'urgent', 'routine', 'self-care']
const MAX_MESSAGE_LENGTH = 1200
const MAX_SPECIALTY_LENGTH = 80

function stripControlCharacters(value: string): string {
  // Keep normal whitespace (spaces, newlines, tabs) but drop other controls.
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
}

function readBody(req: Request): Record<string, unknown> {
  if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
    throw new HttpError(400, 'Request body must be a JSON object.', 'invalid_request')
  }
  return req.body as Record<string, unknown>
}

function parseInput(req: Request): AssistantRequestInput {
  const body = readBody(req)

  if (typeof body.message !== 'string') {
    throw new HttpError(400, 'A message string is required.', 'invalid_request')
  }
  const message = stripControlCharacters(body.message).trim()
  if (message.length < 2) {
    throw new HttpError(400, 'Please enter a longer question.', 'invalid_request')
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new HttpError(
      400,
      `Please keep the message under ${MAX_MESSAGE_LENGTH} characters.`,
      'invalid_request',
    )
  }

  const locale = typeof body.locale === 'string' ? body.locale : 'en'
  if (!locales.includes(locale as AssistantLocale)) {
    throw new HttpError(400, 'Unsupported locale.', 'invalid_request')
  }

  const rawUrgency = body.triageUrgency ?? null
  if (rawUrgency !== null && !urgencies.includes(rawUrgency as TriageUrgency)) {
    throw new HttpError(400, 'Unknown triage urgency.', 'invalid_request')
  }

  const rawSpecialty = body.specialty ?? null
  if (rawSpecialty !== null && typeof rawSpecialty !== 'string') {
    throw new HttpError(400, 'Specialty must be a string.', 'invalid_request')
  }
  const specialty = rawSpecialty
    ? stripControlCharacters(rawSpecialty).trim().slice(0, MAX_SPECIALTY_LENGTH)
    : null

  return {
    message,
    locale: locale as AssistantLocale,
    triageUrgency: rawUrgency as TriageUrgency | null,
    specialty: specialty || null,
  }
}

export function getAiStatus(
  _req: Request,
  res: Response<ApiResponse<AiStatus>>,
): void {
  const configured = isAiConfigured()
  res.status(200).json({
    success: true,
    data: {
      configured,
      mode: configured ? 'gemini' : 'fallback',
      model: configured ? env.geminiModel : 'offline-guidance',
      emergencyNumbers: [...EMERGENCY_NUMBERS],
      notice: AI_DISCLAIMER,
    },
  })
}

export async function postAssistant(
  req: Request,
  res: Response<ApiResponse<AssistantReply>>,
): Promise<void> {
  const input = parseInput(req)
  const result = await generateAssistantReply(input)

  if (!result.ok) {
    const status =
      result.code === 'ai_quota_exceeded'
        ? 429
        : result.code === 'ai_blocked'
          ? 422
          : 503
    throw new HttpError(status, result.message, result.code)
  }

  res.status(200).json({
    success: true,
    data: {
      reply: result.reply,
      model: result.model,
      provider: result.provider,
      redactions: result.redactions,
      emergencyNumbers: [...EMERGENCY_NUMBERS],
      notice: AI_DISCLAIMER,
    },
  })
}
