import {
  Bot,
  CircleAlert,
  Loader2,
  PhoneCall,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  WifiOff,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { Card } from '../components/ui/Card'
import { ApiError, getAiStatus, sendAssistantMessage } from '../services/api'
import type {
  AiStatus,
  AssistantLocale,
  AssistantUrgency,
} from '../types/api'
import { buildOfflineGuidance, mentionsEmergency } from '../utils/assistantFallback'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  source?: 'gemini' | 'offline' | 'safety-triage'
  redactions?: number
}

type ConnectionState = 'connecting' | 'connected' | 'offline'

const urgencies: AssistantUrgency[] = ['emergency', 'urgent', 'routine', 'self-care']

const localeLabels: Array<{ value: AssistantLocale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी · Hindi' },
  { value: 'te', label: 'తెలుగు · Telugu' },
]

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: `Hello — I'm the MediPulse demo health assistant. I can explain health topics and medical terms, suggest sensible next steps, and help you prepare questions for a doctor.

I can't diagnose conditions, prescribe medicines, or decide insurance claims. For anything urgent or life-threatening, call 112 or 108 in India straight away.

What would you like to understand better?`,
  source: 'safety-triage',
}

const emergencyReplyText = `Your message mentions a possible emergency warning sign.

Call 112 or 108 in India now, or go to the nearest emergency department. Do not wait for a chat reply. A triage result marked as an emergency should always be treated as urgent.`

function readParams(searchParams: URLSearchParams): {
  urgency: AssistantUrgency | null
  specialty: string | null
} {
  const rawUrgency = searchParams.get('urgency')
  const urgency = urgencies.find((item) => item === rawUrgency) ?? null
  const specialty = searchParams.get('specialty')?.slice(0, 80) ?? null
  return { urgency, specialty }
}

export function AssistantPage() {
  const [searchParams] = useSearchParams()
  const { urgency, specialty } = readParams(searchParams)
  const [status, setStatus] = useState<AiStatus | null>(null)
  const [statusKnown, setStatusKnown] = useState(false)
  const [connection, setConnection] = useState<ConnectionState>('connecting')
  const [locale, setLocale] = useState<AssistantLocale>('en')
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [lastIssue, setLastIssue] = useState<string | null>(null)
  const idCounter = useRef(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const nextId = () => {
    idCounter.current += 1
    return `msg-${idCounter.current}`
  }

  // The status probe retries a few times so a backend that is still starting
  // (or a transient CORS/network blip) does not pin the UI to offline forever.
  const probeStatus = useCallback(async (signal?: AbortSignal): Promise<AiStatus | null> => {
    const MAX_ATTEMPTS = 3

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      if (signal?.aborted) return null
      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), 8_000)

      try {
        const result = await getAiStatus(controller.signal)
        if (signal?.aborted) return null
        return result
      } catch {
        if (signal?.aborted) return null
      } finally {
        window.clearTimeout(timer)
      }

      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => window.setTimeout(resolve, 700 * attempt))
      }
    }

    return null
  }, [])

  const applyStatus = useCallback((result: AiStatus | null) => {
    if (!result) {
      setStatusKnown(false)
      setConnection('offline')
      return
    }
    setStatus(result)
    setStatusKnown(true)
    setConnection(result.configured ? 'connected' : 'offline')
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    probeStatus(controller.signal).then((result) => {
      if (!controller.signal.aborted) applyStatus(result)
    })
    return () => controller.abort()
  }, [probeStatus, applyStatus])

  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, isSending])

  const appendOffline = (text: string, note?: string) => {
    setMessages((current) => [
      ...current,
      {
        id: nextId(),
        role: 'assistant',
        text: note ? `${note}\n\n${text}` : text,
        source: 'offline',
      },
    ])
  }

  const send = async (rawMessage: string) => {
    const message = rawMessage.trim()
    if (!message || isSending) return

    setMessages((current) => [
      ...current,
      { id: nextId(), role: 'user', text: message },
    ])
    setInput('')
    setLastIssue(null)

    if (urgency === 'emergency' || mentionsEmergency(message)) {
      setMessages((current) => [
        ...current,
        { id: nextId(), role: 'assistant', text: emergencyReplyText, source: 'safety-triage' },
      ])
      return
    }

    // Only skip the network call when the server itself confirmed there is no
    // Gemini key. If the status probe simply could not reach the backend, still
    // try the request so the assistant can recover without a page reload.
    if (statusKnown && status?.configured === false) {
      appendOffline(
        buildOfflineGuidance(message, { urgency, specialty }),
        'Offline guidance (live AI is unavailable):',
      )
      return
    }

    setIsSending(true)
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 60_000)

    try {
      const reply = await sendAssistantMessage(
        {
          message,
          locale,
          triageUrgency: urgency,
          specialty,
        },
        controller.signal,
      )
      setStatus((current) => current ?? {
        configured: true,
        mode: 'gemini',
        model: reply.model,
        emergencyNumbers: reply.emergencyNumbers,
        notice: reply.notice,
      })
      setStatusKnown(true)
      setConnection('connected')
      setLastIssue(null)
      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: 'assistant',
          text: reply.redactions > 0
            ? `${reply.reply}\n\n(Some personal identifiers were removed before sending this message.)`
            : reply.reply,
          source: reply.provider === 'gemini' ? 'gemini' : 'safety-triage',
          redactions: reply.redactions,
        },
      ])
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError'
      const reason = aborted
        ? 'The assistant took too long to respond.'
        : error instanceof ApiError
          ? error.message
          : 'The assistant service could not be reached.'
      setLastIssue(reason)
      const networkFailure = !aborted && !(error instanceof ApiError)
      if (networkFailure || !statusKnown) setConnection('offline')
      appendOffline(
        buildOfflineGuidance(message, { urgency, specialty }),
        `${reason} Here is offline guidance instead:`,
      )
    } finally {
      window.clearTimeout(timer)
      setIsSending(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void send(input)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(input)
    }
  }

  const quickPrompts = [
    urgency ? 'Explain what my triage result means and what I should do next.' : null,
    'Which specialist should I see for recurring headaches?',
    'Help me prepare questions to ask my doctor.',
    'What can I do at home for a mild sore throat?',
  ].filter((prompt): prompt is string => Boolean(prompt))

  const modeLabel =
    connection === 'connecting'
      ? 'Connecting to Gemini…'
      : connection === 'connected' && status?.configured
        ? `Connected · Gemini · ${status.model}`
        : 'Offline guidance mode'

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="AI health assistant"
        title="Understand your health, safely"
        description="General health education, plain-language explanations, and preparation for a doctor visit. Never a diagnosis or a prescription."
        actions={
          <button
            type="button"
            onClick={() => setMessages([WELCOME_MESSAGE])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 py-2 text-xs font-semibold text-brand-navy-soft transition-colors hover:bg-brand-surface"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Clear chat
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue-soft px-2.5 py-1 text-[11px] font-semibold text-brand-blue-dark">
          {connection === 'offline' ? (
            <WifiOff className="size-3" aria-hidden="true" />
          ) : connection === 'connecting' ? (
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-3" aria-hidden="true" />
          )}
          {modeLabel}
        </span>
        {specialty ? (
          <span className="inline-flex rounded-full bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand-navy-soft">
            Triage context: {specialty}
          </span>
        ) : null}
        {urgency ? (
          <span className="inline-flex rounded-full bg-brand-warning-soft px-2.5 py-1 text-[11px] font-semibold text-brand-warning">
            Last triage: {urgency}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal-soft px-2.5 py-1 text-[11px] font-semibold text-brand-teal-dark">
          <ShieldAlert className="size-3" aria-hidden="true" />
          Demo assistant
        </span>
      </div>

      {urgency === 'emergency' ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand-critical/25 bg-brand-critical-soft px-3.5 py-3 text-xs leading-relaxed text-brand-critical"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">A triage result marked as an emergency should never wait for this chat.</p>
            <p className="mt-1">
              Call{' '}
              <a href="tel:112" className="font-bold underline">112</a> or{' '}
              <a href="tel:108" className="font-bold underline">108</a> now, or go to the nearest emergency department.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-brand-warning-soft px-3.5 py-3 text-[11px] leading-relaxed text-brand-warning">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            General education only — this demo cannot diagnose, prescribe medicine, or decide insurance
            eligibility. In an emergency call{' '}
            <a href="tel:112" className="font-bold underline">112</a> or{' '}
            <a href="tel:108" className="font-bold underline">108</a>. Do not type policy numbers, phone
            numbers, or full names.
          </p>
        </div>
      )}

      {connection === 'offline' ? (
        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-brand-surface px-3.5 py-2.5 text-[11px] font-medium text-brand-navy-soft">
          <WifiOff className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            {statusKnown && status?.configured === false
              ? 'The server has no Gemini key configured, so replies come from a transparent offline guide.'
              : 'The AI backend could not be reached, so replies come from a transparent offline guide. Sending a message retries the live service automatically.'}
          </span>
          <button
            type="button"
            onClick={() => {
              setConnection('connecting')
              void probeStatus().then(applyStatus)
            }}
            className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline"
          >
            <RefreshCw className="size-3" aria-hidden="true" />
            Retry connection
          </button>
        </div>
      ) : null}

      <Card className="overflow-hidden bg-white p-0">
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Assistant conversation"
          className="max-h-[26rem] min-h-[22rem] space-y-3 overflow-y-auto px-4 py-4 sm:px-5"
        >
          {messages.map((message) =>
            message.role === 'user' ? (
              <div key={message.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-blue px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white">
                  {message.text}
                </p>
              </div>
            ) : (
              <div key={message.id} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-teal-soft text-brand-teal-dark">
                  <Bot className="size-4" aria-hidden="true" />
                </span>
                <div className="max-w-[85%]">
                  <p className="rounded-2xl rounded-bl-md bg-brand-surface px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-brand-navy">
                    {message.text}
                  </p>
                  {message.source === 'offline' ? (
                    <p className="mt-1 text-[10px] font-medium text-brand-navy-soft/75">
                      Offline guidance · not a diagnosis
                    </p>
                  ) : message.source === 'gemini' ? (
                    <p className="mt-1 text-[10px] font-medium text-brand-navy-soft/75">
                      AI-generated · can be wrong · not medical advice
                    </p>
                  ) : null}
                </div>
              </div>
            ),
          )}
          {isSending ? (
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-teal-soft text-brand-teal-dark">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-brand-surface px-3.5 py-2.5 text-xs font-medium text-brand-navy-soft">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Thinking…
              </span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-brand-line px-4 py-4 sm:px-5">
          {lastIssue ? (
            <p role="alert" className="mb-2 text-[11px] font-medium text-brand-critical">
              {lastIssue}
            </p>
          ) : null}
          <div className="mb-2.5 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void send(prompt)}
                disabled={isSending}
                className="rounded-full border border-brand-line bg-white px-2.5 py-1 text-[11px] font-medium text-brand-navy-soft transition-colors hover:border-brand-blue/40 hover:text-brand-blue disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <label className="flex-1">
              <span className="sr-only">Message the health assistant</span>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                maxLength={1200}
                placeholder="Ask about a symptom, a medical term, or how to prepare for a doctor visit…"
                className="min-h-12 w-full resize-none rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm text-brand-navy outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
              />
            </label>
            <button
              type="submit"
              disabled={isSending || input.trim().length < 2}
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-5" aria-hidden="true" />
              )}
            </button>
          </form>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-[11px] font-medium text-brand-navy-soft">
              Reply language
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value as AssistantLocale)}
                className="rounded-lg border border-brand-line bg-white px-2 py-1 text-[11px] font-semibold text-brand-navy outline-none focus:border-brand-blue"
              >
                {localeLabels.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-critical hover:underline"
            >
              <PhoneCall className="size-3" aria-hidden="true" />
              Emergency: 112 / 108
            </a>
          </div>
        </div>
      </Card>

      <p className="mt-3 text-[10px] leading-relaxed text-brand-navy-soft/75">
        Messages are sent to a Google Gemini model only when the server has a key configured; policy
        numbers, phone numbers, and email addresses are removed first. The assistant is never used for
        insurance eligibility, and it cannot book appointments or change your demo data. If the model is
        unavailable, transparent offline guidance is shown instead. AI output can be inaccurate — always
        confirm with a qualified clinician.
      </p>
    </div>
  )
}
