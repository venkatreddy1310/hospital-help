import type { Specialty } from '../types/domain'
import type {
  AgeGroupId,
  SymptomId,
  TriageAnswers,
  TriageAssessment,
  TriageUrgency,
} from '../types/triage'
import {
  ageGroupOptions,
  durationOptions,
  emergencySignOptions,
  getOptionLabel,
  severityOptions,
  symptomOptions,
  symptomSpecialties,
} from './triageData'

const HIGH_RISK_SYMPTOMS: SymptomId[] = ['breathing', 'chest', 'injury']
const VULNERABLE_AGE_GROUPS: AgeGroupId[] = ['under-5', '65-plus']

const trendReasons = {
  better: 'Symptoms are getting better.',
  same: 'Symptoms are staying about the same.',
  worse: 'Symptoms are getting worse.',
} as const

function buildReasons(answers: TriageAnswers): string[] {
  const reasons: string[] = []
  const selectedSymptoms = symptomOptions.filter((option) =>
    answers.symptoms.includes(option.id),
  )

  if (selectedSymptoms.length > 0) {
    const noun = selectedSymptoms.length === 1 ? 'Symptom' : 'Symptoms'
    reasons.push(
      `${noun} selected: ${selectedSymptoms.map((option) => option.label).join(', ')}.`,
    )
  }

  if (answers.duration) {
    const label = getOptionLabel(durationOptions, answers.duration)
    reasons.push(`Duration: ${label.charAt(0).toLowerCase()}${label.slice(1)}.`)
  }

  if (answers.severity) {
    reasons.push(
      `Self-reported severity: ${getOptionLabel(severityOptions, answers.severity).toLowerCase()}.`,
    )
  }

  if (answers.ageGroup) {
    reasons.push(`Age group: ${getOptionLabel(ageGroupOptions, answers.ageGroup)}.`)
  }

  if (answers.trend) {
    reasons.push(trendReasons[answers.trend])
  }

  return reasons
}

function getRecommendedSpecialties(answers: TriageAnswers): Specialty[] {
  const specialties = new Set<Specialty>()

  symptomOptions.forEach((option) => {
    if (!answers.symptoms.includes(option.id)) return
    symptomSpecialties[option.id].forEach((specialty) => specialties.add(specialty))
  })

  if (answers.ageGroup === 'under-5' || answers.ageGroup === '5-17') {
    specialties.add('Paediatrics')
  }

  if (specialties.size === 0) {
    specialties.add('General Medicine')
  }

  return [...specialties].slice(0, 3)
}

function buildAssessment(
  urgency: TriageUrgency,
  explanation: string,
  nextStep: string,
  reasons: string[],
  recommendedSpecialties: Specialty[],
): TriageAssessment {
  return { urgency, explanation, nextStep, reasons, recommendedSpecialties }
}

/**
 * Transparent demo triage rules. This is not a clinical model and does not
 * diagnose conditions. Emergency warning signs always take priority.
 */
export function assessTriage(answers: TriageAnswers): TriageAssessment {
  const recommendedSpecialties = getRecommendedSpecialties(answers)
  const reasons = buildReasons(answers)
  const severity = answers.severity
  const highRiskSymptom = answers.symptoms.some((symptom) =>
    HIGH_RISK_SYMPTOMS.includes(symptom),
  )
  const vulnerableAge = answers.ageGroup
    ? VULNERABLE_AGE_GROUPS.includes(answers.ageGroup)
    : false
  const worsening = answers.trend === 'worse'
  const longDuration = answers.duration === 'more-than-week'
  const multipleSymptoms = answers.symptoms.length >= 3

  if (answers.emergencySigns.length > 0) {
    const warningLabels = answers.emergencySigns.map((sign) =>
      getOptionLabel(emergencySignOptions, sign),
    )

    return buildAssessment(
      'emergency',
      'You reported at least one emergency warning sign. This demo stops the standard assessment and prioritizes emergency guidance.',
      "Call 112 or 108 now and follow the dispatcher's instructions. Ask someone to stay with you, and do not drive yourself if you feel severely unwell.",
      [
        `Emergency warning reported: ${warningLabels.join(', ')}.`,
        'Emergency warnings override every other answer in this demo.',
      ],
      recommendedSpecialties,
    )
  }

  if (severity === 'severe' && highRiskSymptom) {
    return buildAssessment(
      'emergency',
      'You rated your symptoms as severe and selected breathing difficulty, chest discomfort, or an injury. This demo escalates to emergency guidance instead of a routine result.',
      'Call 112 or 108 now, or have someone take you to the nearest emergency department. Do not wait for a routine appointment.',
      [
        ...reasons,
        'Severe symptoms with a high-risk symptom are escalated in this demo.',
      ],
      recommendedSpecialties,
    )
  }

  if (severity === 'severe') {
    return buildAssessment(
      'urgent',
      'You rated your symptoms as severe. This demo recommends a prompt in-person assessment, even if you did not report a warning sign.',
      'Contact a doctor or visit an urgent care service today. If warning signs appear or symptoms worsen, call 112 or 108.',
      [...reasons, 'Severe self-reported symptoms need prompt attention.'],
      recommendedSpecialties,
    )
  }

  if (severity === 'moderate') {
    const needsPromptAssessment =
      highRiskSymptom || worsening || multipleSymptoms || vulnerableAge

    if (needsPromptAssessment) {
      const triggers = [
        highRiskSymptom ? 'a higher-risk symptom' : null,
        worsening ? 'symptoms that are getting worse' : null,
        multipleSymptoms ? 'three or more symptoms' : null,
        vulnerableAge ? 'an age group that may need extra caution' : null,
      ].filter((trigger): trigger is string => trigger !== null)

      return buildAssessment(
        'urgent',
        'Your answers suggest symptoms that should be checked promptly by a healthcare professional. This is demo guidance, not a diagnosis.',
        'Contact a doctor or visit an urgent care service today. If warning signs appear or symptoms worsen, call 112 or 108.',
        [...reasons, `Prompt assessment is suggested because of ${triggers.join(', ')}.`],
        recommendedSpecialties,
      )
    }

    return buildAssessment(
      'routine',
      'Your moderate symptoms do not trigger the demo emergency rules, but a routine medical consultation can help you get appropriate advice.',
      'Arrange a consultation with a doctor in the next few days. Seek urgent help if symptoms worsen or warning signs appear.',
      reasons,
      recommendedSpecialties,
    )
  }

  const selfCareEligible =
    severity === 'mild' &&
    !worsening &&
    !longDuration &&
    !vulnerableAge &&
    answers.symptoms.length <= 2 &&
    (answers.duration === 'today' || answers.duration === '1-2-days')

  if (selfCareEligible) {
    return buildAssessment(
      'self-care',
      'You described mild, short-duration symptoms without warning signs. This demo shows only general wellness guidance, not a diagnosis.',
      'Rest, drink water, and keep monitoring how you feel. Speak to a clinician if symptoms persist, get worse, or warning signs appear.',
      reasons,
      recommendedSpecialties,
    )
  }

  return buildAssessment(
    'routine',
    'Your answers do not trigger the demo emergency rules, but a routine medical consultation is reasonable for symptoms that are ongoing or not improving.',
    'Arrange a consultation with a doctor in the next few days. Seek urgent help if symptoms worsen or warning signs appear.',
    reasons,
    recommendedSpecialties,
  )
}
