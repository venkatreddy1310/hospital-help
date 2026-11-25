const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const POLICY_PATTERN = /\b[A-Z]{2,}[-/]\d{6,}[A-Z0-9-]*\b/gi
const NUMBER_CANDIDATE = /\+?\d[\d\s().-]{6,}\d/g

export interface RedactionResult {
  text: string
  redactions: number
}

/**
 * Strips identifiers we never want forwarded to a third-party model: email
 * addresses, long digit runs (phone/policy/member numbers), and policy-style
 * codes. Runs on the server so the raw text is not forwarded or logged.
 */
export function redactPersonalData(value: string): RedactionResult {
  let redactions = 0
  let text = value

  text = text.replace(EMAIL_PATTERN, () => {
    redactions += 1
    return '[email removed]'
  })

  text = text.replace(POLICY_PATTERN, () => {
    redactions += 1
    return '[policy number removed]'
  })

  text = text.replace(NUMBER_CANDIDATE, (match) => {
    const digits = match.replace(/\D/g, '')
    if (digits.length < 9) return match
    redactions += 1
    return '[number removed]'
  })

  return { text, redactions }
}
