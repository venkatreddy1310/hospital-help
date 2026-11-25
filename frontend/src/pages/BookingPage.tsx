import { ArrowLeft, CalendarCheck2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookingConfirmation } from '../components/booking/BookingConfirmation'
import { BookingConsultationStep } from '../components/booking/BookingConsultationStep'
import { BookingDateStep } from '../components/booking/BookingDateStep'
import { BookingHospitalStep } from '../components/booking/BookingHospitalStep'
import { BookingPatientStep } from '../components/booking/BookingPatientStep'
import { BookingReviewStep } from '../components/booking/BookingReviewStep'
import { BookingSlotStep } from '../components/booking/BookingSlotStep'
import { DemoNotice } from '../components/common/DemoNotice'
import { FlowStepCard } from '../components/common/FlowStepCard'
import { StepProgress } from '../components/common/StepProgress'
import { DoctorAvatar } from '../components/specialists/DoctorAvatar'
import { Card } from '../components/ui/Card'
import { useAccount } from '../context/accountStore'
import { useAppointments } from '../context/appointmentStore'
import { useAuth } from '../context/authStore'
import { useDemoCatalog } from '../context/catalogStore'
import { useServiceLocation } from '../context/locationStore'
import type { BookingDraft, BookingStep, Appointment } from '../types/appointment'
import { careProfileToPatientProfile } from '../utils/account'
import { createDemoAppointment, formatDemoFee } from '../utils/appointments'
import { getHospitalsForLocationFrom } from '../utils/demoData'
import {
  getSpecialistHospitals,
  isSlotBooked,
  isSlotPast,
} from '../utils/specialistDirectory'
import { getSpecialtyLabel } from '../utils/specialists'

const BOOKING_STEPS = [
  'Patient',
  'Hospital',
  'Date',
  'Time',
  'Consultation',
  'Review',
] as const

const STEP_COPY: Record<BookingStep, { title: string; description: string }> = {
  1: {
    title: 'Who is this appointment for?',
    description:
      'Choose one of your account’s simulated patient or family profiles for this demo booking.',
  },
  2: {
    title: 'Choose a demo hospital',
    description:
      'Select one of this fictional doctor’s associated hospitals. Distances follow your chosen location.',
  },
  3: {
    title: 'Pick a date',
    description:
      'Choose from the next five simulated clinic days. Fully booked dates are disabled.',
  },
  4: {
    title: 'Choose a time slot',
    description:
      'Only unbooked demo slots can be selected. Cancelled bookings release their slot in this browser.',
  },
  5: {
    title: 'Select a consultation type',
    description:
      'Both options are simulations. No call, visit, or payment is arranged through MediPulse.',
  },
  6: {
    title: 'Review your demo booking',
    description:
      'Check the details below before creating the local demo appointment record.',
  },
}

export function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { location } = useServiceLocation()
  const { hospitals: catalogHospitals, specialists } = useDemoCatalog()
  const { appointments, addAppointment } = useAppointments()
  const { user } = useAuth()
  const { profiles, activeProfileId } = useAccount()

  const patientOptions = useMemo(
    () => profiles.map(careProfileToPatientProfile),
    [profiles],
  )

  const hospitals = useMemo(
    () => getHospitalsForLocationFrom(catalogHospitals, location.id),
    [catalogHospitals, location.id],
  )
  const doctor = specialists.find(
    (specialist) => specialist.id === id && specialist.active,
  )
  const doctorHospitals = useMemo(
    () => (doctor ? getSpecialistHospitals(doctor, hospitals) : []),
    [doctor, hospitals],
  )

  const [step, setStep] = useState<BookingStep>(1)
  const [draft, setDraft] = useState<BookingDraft>(() => ({
    patientId: activeProfileId,
    hospitalId: null,
    date: null,
    time: null,
    consultationType: null,
  }))
  const [error, setError] = useState<string | null>(null)
  const [confirmedAppointment, setConfirmedAppointment] =
    useState<Appointment | null>(null)

  const selectedPatientId = draft.patientId ?? activeProfileId

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step, confirmedAppointment])

  useEffect(() => {
    if (!confirmedAppointment) return
    document.getElementById('booking-confirmation-heading')?.focus()
  }, [confirmedAppointment])

  if (!doctor) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          to="/specialists"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All specialists
        </Link>
        <Card className="bg-white">
          <h1 className="text-lg font-bold text-brand-navy">Booking unavailable</h1>
          <p className="mt-2 text-sm text-brand-navy-soft">
            This booking link does not match an active simulated demo doctor. The profile
            may be inactive in the demo admin console.
          </p>
          <Link
            to="/specialists"
            className="mt-4 inline-flex rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Back to directory
          </Link>
        </Card>
      </div>
    )
  }

  const patient =
    patientOptions.find((item) => item.id === selectedPatientId) ?? null
  const selectedCareProfile =
    profiles.find((profile) => profile.id === selectedPatientId) ?? null
  const selectedHospital =
    doctorHospitals.find((hospital) => hospital.id === draft.hospitalId) ?? null

  const selectHospital = (hospitalId: string) => {
    if (draft.hospitalId === hospitalId) return
    setDraft((current) => ({
      ...current,
      hospitalId,
      date: null,
      time: null,
    }))
    setError(null)
  }

  const selectDate = (date: string) => {
    setDraft((current) => ({
      ...current,
      date,
      time: current.date === date ? current.time : null,
    }))
    setError(null)
  }

  const confirmBooking = async () => {
    if (
      !patient ||
      !selectedHospital ||
      !draft.date ||
      !draft.time ||
      !draft.consultationType
    ) {
      setError('Complete every booking step before confirming.')
      return
    }

    if (
      isSlotBooked(appointments, doctor.id, draft.date, draft.time) ||
      isSlotPast(draft.date, draft.time)
    ) {
      setError('That demo slot is no longer available. Choose another time.')
      setStep(4)
      return
    }

    const appointment = createDemoAppointment({
      doctor,
      patient,
      hospital: selectedHospital,
      date: draft.date,
      time: draft.time,
      consultationType: draft.consultationType,
      ownerId: user?.id,
      patientKind: selectedCareProfile?.kind,
    })

    const saveError = await addAppointment(appointment)
    if (saveError) {
      setError(saveError)
      return
    }

    setConfirmedAppointment(appointment)
    setError(null)
  }

  const handleContinue = () => {
    setError(null)

    if (step === 1 && !patient) {
      setError('Select a patient profile, or create one from Account, to continue.')
      return
    }
    if (step === 2 && !selectedHospital) {
      setError('Choose a hospital for this demo appointment.')
      return
    }
    if (step === 3 && !draft.date) {
      setError('Choose an available date.')
      return
    }
    if (step === 4) {
      if (!draft.time) {
        setError('Choose an available time slot.')
        return
      }
      if (
        draft.date &&
        (isSlotBooked(appointments, doctor.id, draft.date, draft.time) ||
          isSlotPast(draft.date, draft.time))
      ) {
        setError('That demo slot is no longer available. Choose another time.')
        return
      }
    }
    if (step === 5 && !draft.consultationType) {
      setError('Choose a consultation type.')
      return
    }
    if (step === 6) {
      void confirmBooking()
      return
    }

    setStep((current) => (current + 1) as BookingStep)
  }

  const handleBack = () => {
    setError(null)

    if (step === 1) {
      navigate(`/specialists/${doctor.id}`)
      return
    }

    setStep((current) => (current - 1) as BookingStep)
  }

  if (confirmedAppointment) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          to={`/specialists/${doctor.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to doctor profile
        </Link>
        <BookingConfirmation appointment={confirmedAppointment} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={`/specialists/${doctor.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to doctor profile
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-line bg-white p-3.5 shadow-sm">
        <DoctorAvatar
          name={doctor.name}
          specialty={doctor.specialty}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-navy">{doctor.name}</p>
          <p className="text-[11px] text-brand-navy-soft">
            {getSpecialtyLabel(doctor.specialty)} · {formatDemoFee(doctor.consultationFee)}{' '}
            demo fee
          </p>
        </div>
        <span className="rounded-full bg-brand-teal-soft px-2.5 py-1 text-[10px] font-semibold text-brand-teal-dark">
          Demo booking
        </span>
      </div>

      <DemoNotice className="mb-4">
        This guided flow creates a simulated appointment record in this browser only. No
        real hospital is contacted, no real slot is reserved, and no payment is collected.
      </DemoNotice>

      <StepProgress current={step} steps={BOOKING_STEPS} ariaLabel="Booking progress" />

      <div className="mt-3">
        <FlowStepCard
          eyebrow={`Appointment booking · Step ${step}`}
          title={STEP_COPY[step].title}
          description={STEP_COPY[step].description}
          error={error}
          headingId="booking-step-heading"
          backLabel={step === 1 ? 'Doctor profile' : 'Back'}
          primaryLabel={step === 6 ? 'Confirm demo booking' : 'Continue'}
          primaryIcon={step === 6 ? CalendarCheck2 : undefined}
          onBack={handleBack}
          onPrimary={handleContinue}
        >
          {step === 1 ? (
            <BookingPatientStep
              selectedPatientId={selectedPatientId}
              onSelect={(patientId) => {
                setDraft((current) => ({ ...current, patientId }))
                setError(null)
              }}
            />
          ) : null}

          {step === 2 ? (
            <BookingHospitalStep
              hospitals={doctorHospitals}
              selectedHospitalId={draft.hospitalId}
              onSelect={selectHospital}
            />
          ) : null}

          {step === 3 ? (
            <BookingDateStep
              specialist={doctor}
              appointments={appointments}
              selectedDate={draft.date}
              onSelect={selectDate}
            />
          ) : null}

          {step === 4 && draft.date ? (
            <BookingSlotStep
              specialist={doctor}
              date={draft.date}
              appointments={appointments}
              selectedTime={draft.time}
              onSelect={(time) => {
                setDraft((current) => ({ ...current, time }))
                setError(null)
              }}
            />
          ) : null}

          {step === 5 ? (
            <BookingConsultationStep
              specialist={doctor}
              selectedType={draft.consultationType}
              onSelect={(consultationType) => {
                setDraft((current) => ({ ...current, consultationType }))
                setError(null)
              }}
            />
          ) : null}

          {step === 6 ? (
            patient &&
            selectedHospital &&
            draft.date &&
            draft.time &&
            draft.consultationType ? (
              <BookingReviewStep
                doctor={doctor}
                patient={patient}
                hospital={selectedHospital}
                date={draft.date}
                time={draft.time}
                consultationType={draft.consultationType}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-brand-line bg-brand-surface/60 px-4 py-3 text-xs text-brand-navy-soft">
                Some booking details are missing. Go back and complete each step.
              </p>
            )
          ) : null}
        </FlowStepCard>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-brand-navy-soft/80">
        Doctor profiles, hospital associations, availability, and fees are fictional demo
        data. This flow does not provide medical advice or confirm real availability.
      </p>
    </div>
  )
}
