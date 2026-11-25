import type { AssistantUrgency } from '../types/api'

interface OfflineContext {
  urgency: AssistantUrgency | null
  specialty: string | null
}

const emergencyPatterns: RegExp[] = [
  /chest pain|crushing chest|pain in (the )?(left )?arm/i,
  /can(no|')?t breathe|difficulty breathing|shortness of breath|gasping/i,
  /unconscious|fainted|passed out|not responding/i,
  /severe bleeding|bleeding heavily|blood loss/i,
  /stroke|face droop|slurred speech|weakness on one side/i,
  /seizure|convulsion|fitting/i,
  /anaphyla|throat swelling|tongue swelling/i,
  /suicid|kill myself|self[- ]harm|end my life/i,
  /pregnan\w*.*(bleed|pain)|bleed\w*.*pregnan/i,
]

const specialtyRules: Array<{ pattern: RegExp; specialty: string }> = [
  { pattern: /heart|chest|palpitation|blood pressure|cholesterol/i, specialty: 'Cardiology' },
  { pattern: /headache|migraine|seizure|dizzy|numb|tingling|memory|stroke/i, specialty: 'Neurology' },
  { pattern: /child|baby|infant|toddler|kid|vaccin/i, specialty: 'Paediatrics' },
  { pattern: /bone|joint|knee|back|shoulder|fracture|sprain|neck pain/i, specialty: 'Orthopaedics' },
  { pattern: /skin|rash|acne|itch|hair|nail|eczema|mole/i, specialty: 'Dermatology' },
  { pattern: /period|menstrual|pregnan|pelvic|vaginal|breast|pcos/i, specialty: 'Gynaecology' },
  { pattern: /ear|nose|throat|sinus|hearing|sore throat|tonsil/i, specialty: 'ENT' },
]

const askPattern = /ask|question|doctor|consult|appointment|specialist/i

export function mentionsEmergency(message: string): boolean {
  return emergencyPatterns.some((pattern) => pattern.test(message))
}

function pickSpecialty(message: string, context: OfflineContext): string {
  const match = specialtyRules.find((rule) => rule.pattern.test(message))
  return match?.specialty ?? context.specialty ?? 'General Medicine'
}

export function buildOfflineGuidance(message: string, context: OfflineContext): string {
  if (context.urgency === 'emergency' || mentionsEmergency(message)) {
    return [
      'Your message mentions a possible emergency warning sign.',
      '',
      'Call 112 or 108 in India now, or go to the nearest emergency department. Do not wait for a chat reply, and do not try to manage a possible emergency at home.',
      '',
      'A triage result marked as an emergency should always be treated as urgent.',
    ].join('\n')
  }

  const specialty = pickSpecialty(message, context)
  const lines: string[] = [
    'Built-in offline guidance. The AI service is unavailable, so this answer uses simple demo rules — it is general health education, not a diagnosis.',
    '',
  ]

  if (context.urgency === 'urgent') {
    lines.push('Your last symptom check was marked urgent. Arrange a same-day assessment with a doctor or urgent care clinic.', '')
  } else if (context.urgency === 'routine') {
    lines.push('Your last symptom check suggested a routine consultation. Book an appointment in the next few days if symptoms continue.', '')
  } else if (context.urgency === 'self-care') {
    lines.push('Your last symptom check suggested self-care. Rest, stay hydrated, and watch for any warning signs.', '')
  }

  lines.push(
    'What this may relate to: many everyday symptoms have several possible causes, and only a clinician can assess yours properly.',
    '',
    'Practical next steps:',
    '- Note when symptoms started, what makes them better or worse, and any medicines you already take.',
    '- Rest, drink water, and avoid starting new medicines without advice from a doctor or pharmacist.',
    '- If symptoms get worse quickly, seek urgent care rather than waiting.',
    '',
    `Specialty that may be relevant: ${specialty}. You can browse demo specialists from the Specialists tab.`,
  )

  if (askPattern.test(message)) {
    lines.push(
      '',
      'Questions worth asking a doctor:',
      '- What could be causing these symptoms?',
      '- What warning signs should make me seek help sooner?',
      '- Do I need any tests, and what are the risks and benefits?',
      '- What can I safely do at home in the meantime?',
    )
  }

  lines.push(
    '',
    'If you feel very unwell, have trouble breathing, severe pain, or feel faint, call 112 or 108 immediately. This demo cannot diagnose, prescribe, or verify insurance.',
  )

  return lines.join('\n')
}
