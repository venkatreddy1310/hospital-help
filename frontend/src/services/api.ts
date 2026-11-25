import type {
  AiStatus,
  ApiResponse,
  AssistantReply,
  AssistantRequest,
  HealthStatus,
} from '../types/api'

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || payload === null || !payload.success) {
    const message =
      payload !== null && !payload.success
        ? payload.error.message
        : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status)
  }

  return payload.data
}

export function getHealth(signal?: AbortSignal): Promise<HealthStatus> {
  return request<HealthStatus>('/health', { signal })
}

export function getAiStatus(signal?: AbortSignal): Promise<AiStatus> {
  return request<AiStatus>('/ai/status', { signal })
}

export function sendAssistantMessage(
  input: AssistantRequest,
  signal?: AbortSignal,
): Promise<AssistantReply> {
  return request<AssistantReply>('/ai/assistant', {
    method: 'POST',
    body: input,
    signal,
  })
}
