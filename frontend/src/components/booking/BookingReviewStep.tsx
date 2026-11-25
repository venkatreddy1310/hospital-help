import type { PatientProfile } from '../../types/appointment'
import type { ConsultationType, Hospital, Specialist } from '../../types/domain'
import { DemoNotice } from '../common/DemoNotice'
import { BookingSummary } from './BookingSummary'

interface BookingReviewStepProps {
  doctor: Specialist
  patient: PatientProfile
  hospital: Hospital
  date: string
  time: string
  consultationType: ConsultationType
}

export function BookingReviewStep({
  doctor,
  patient,
  hospital,
  date,
  time,
  consultationType,
}: BookingReviewStepProps) {
  return (
    <div>
      <BookingSummary
        doctorName={doctor.name}
        specialty={doctor.specialty}
        patientName={patient.name}
        hospitalName={hospital.name}
        date={date}
        time={time}
        consultationType={consultationType}
        fee={doctor.consultationFee}
      />
      <DemoNotice className="mt-4">
        Confirming creates a local demo appointment record only. No real hospital
        appointment is made, no clinician is contacted, and no payment is taken.
      </DemoNotice>
      <p className="mt-3 text-[11px] leading-relaxed text-brand-navy-soft/80">
        You can cancel this demo booking later from My Appointments. Availability is
        simulated and may change when you create or cancel demo bookings.
      </p>
    </div>
  )
}
