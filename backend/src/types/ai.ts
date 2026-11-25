export type TriageUrgency = 'emergency' | 'urgent' | 'routine' | 'self-care'

export type AssistantLocale = 'en' | 'hi' | 'te'

export interface AssistantRequestInput {
  message: string
  locale: AssistantLocale
  triageUrgency: TriageUrgency | null
  specialty: string | null
}

export interface AssistantReply {
  reply: string
  model: string
  provider: 'gemini' | 'safety-triage'
  redactions: number
  emergencyNumbers: string[]
  notice: string
}

export interface AiStatus {
  configured: boolean
  mode: 'gemini' | 'fallback'
  model: string
  emergencyNumbers: string[]
  notice: string
}

export const EMERGENCY_NUMBERS = ['112', '108'] as const

export const AI_DISCLAIMER =
  'General health education only — not a diagnosis, prescription, or a substitute for a qualified clinician. For emergencies call 112 or 108 in India immediately.'
