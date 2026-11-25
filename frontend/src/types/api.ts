export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiErrorBody {
  code: string
  message: string
}

export interface ApiFailure {
  success: false
  error: ApiErrorBody
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export interface HealthStatus {
  status: 'ok'
  service: string
  version: string
  environment: string
  timestamp: string
  uptimeSeconds: number
}

export type AssistantUrgency = 'emergency' | 'urgent' | 'routine' | 'self-care'
export type AssistantLocale = 'en' | 'hi' | 'te'

export interface AssistantRequest {
  message: string
  locale: AssistantLocale
  triageUrgency: AssistantUrgency | null
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
