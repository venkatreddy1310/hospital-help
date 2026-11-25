import type { Appointment, AppointmentRecordStatus } from '../types/appointment'
import type { Specialty } from '../types/domain'
import { supabase } from './supabaseClient'

interface AppointmentRow {
  code: string
  owner_id: string
  doctor_code: string
  doctor_name: string
  specialty: string
  patient_kind: 'self' | 'family' | null
  patient_id: string | null
  patient_name: string
  hospital_code: string
  hospital_name: string
  appointment_date: string
  appointment_time: string
  consultation_type: string
  fee: number | string
  status: string
  created_at: string
  cancelled_at: string | null
}

function getClient() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

function mapRow(row: AppointmentRow): Appointment {
  return {
    id: row.code,
    ownerId: row.owner_id,
    doctorId: row.doctor_code,
    doctorName: row.doctor_name,
    specialty: row.specialty as Specialty,
    patientId: row.patient_id ?? '',
    patientName: row.patient_name,
    patientKind: row.patient_kind ?? undefined,
    hospitalId: row.hospital_code,
    hospitalName: row.hospital_name,
    date: row.appointment_date,
    time: row.appointment_time,
    consultationType:
      row.consultation_type === 'online' ? 'online' : 'in-person',
    fee: Number(row.fee),
    status: row.status === 'cancelled' ? 'cancelled' : 'booked',
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at ?? undefined,
  }
}

async function findCatalogId(
  table: 'doctors' | 'hospitals',
  code: string,
): Promise<string> {
  const client = getClient()
  const { data, error } = await client
    .from(table)
    .select('id')
    .eq('code', code)
    .maybeSingle<{ id: string }>()

  if (error) {
    throw new Error('The Supabase catalog could not be checked.')
  }
  if (!data) {
    throw new Error(
      'This demo doctor or hospital is not in the Supabase catalog yet. Seed the directory tables before booking with Supabase configured.',
    )
  }

  return data.id
}

export const appointmentRemote = {
  async list(): Promise<Appointment[]> {
    const client = getClient()
    const { data, error } = await client
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) throw new Error('Appointments could not be loaded.')
    return ((data ?? []) as AppointmentRow[]).map(mapRow)
  },

  async create(appointment: Appointment, ownerId: string): Promise<Appointment> {
    const client = getClient()
    const [doctorId, hospitalId] = await Promise.all([
      findCatalogId('doctors', appointment.doctorId),
      findCatalogId('hospitals', appointment.hospitalId),
    ])

    const row = {
      code: appointment.id,
      owner_id: ownerId,
      doctor_id: doctorId,
      doctor_code: appointment.doctorId,
      doctor_name: appointment.doctorName,
      specialty: appointment.specialty,
      patient_kind: appointment.patientKind ?? 'self',
      patient_id: appointment.patientId,
      patient_profile_id:
        (appointment.patientKind ?? 'self') === 'self'
          ? appointment.patientId
          : null,
      family_member_id:
        appointment.patientKind === 'family' ? appointment.patientId : null,
      patient_name: appointment.patientName,
      hospital_id: hospitalId,
      hospital_code: appointment.hospitalId,
      hospital_name: appointment.hospitalName,
      appointment_date: appointment.date,
      appointment_time: appointment.time,
      consultation_type: appointment.consultationType,
      fee: appointment.fee,
      status: appointment.status,
      created_at: appointment.createdAt,
    }

    const { data, error } = await client
      .from('appointments')
      .insert(row)
      .select('*')
      .single<AppointmentRow>()

    if (error || !data) {
      throw new Error('The appointment could not be saved to your account.')
    }

    return mapRow(data)
  },

  async updateStatus(
    code: string,
    status: AppointmentRecordStatus,
  ): Promise<void> {
    const client = getClient()
    const { error } = await client
      .from('appointments')
      .update({
        status,
        cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
      })
      .eq('code', code)

    if (error) throw new Error('The appointment status could not be updated.')
  },
}
