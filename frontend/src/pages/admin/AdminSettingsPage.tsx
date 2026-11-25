import { Database, RotateCcw, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { FeedbackBanner, type AdminFeedbackState } from '../../components/admin/FeedbackBanner'
import { adminDangerButtonClass } from '../../components/admin/fieldStyles'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { useAppointments } from '../../context/appointmentStore'
import { useAuth } from '../../context/authStore'
import { useDemoCatalog } from '../../context/catalogStore'

export function AdminSettingsPage() {
  const { resetCatalog } = useDemoCatalog()
  const { resetAppointments } = useAppointments()
  const { user, isDemoMode } = useAuth()
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null)

  async function handleReset() {
    resetCatalog()
    const error = await resetAppointments()
    setIsResetOpen(false)

    setFeedback(
      error
        ? { tone: 'error', message: error }
        : {
            tone: 'success',
            message:
              'Demo data was reset. Hospitals, doctors, insurance, patients, and appointments are back to their seeded demo state.',
          },
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin · Settings"
        title="Admin settings"
        description="Data controls and access notes for this preview build."
        actions={
          <Badge tone="neutral">
            {isDemoMode ? 'Demo mode' : 'Supabase role access'}
          </Badge>
        }
      />

      {feedback ? (
        <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} className="mb-4" />
      ) : null}

      <Card className="bg-white">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-warning-soft text-brand-warning">
            <ShieldAlert className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-brand-navy">Access model</h2>
            <p className="mt-1 text-xs leading-relaxed text-brand-navy-soft">
              {isDemoMode
                ? 'This build is running clearly labeled demo mode. The admin console uses a permissive local demo guard; it is not a secure admin boundary. Supabase credentials can enable role-based access.'
                : `Signed in as ${user?.displayName ?? 'an administrator'}. The UI requires the admin role from Supabase user_roles, and database RLS independently enforces admin-only writes. A UI check alone is never treated as authorization.`}
            </p>
            <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-brand-navy-soft">
              <li>· Passwords are handled only by Supabase Auth; none are stored by MediPulse.</li>
              <li>· The service-role key is never included in frontend code or VITE_ variables.</li>
              <li>
                · Catalog editing on this console remains a demo-local management view; patient
                account data uses Supabase when configured.
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="mt-4 bg-white">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue">
            <Database className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-brand-navy">
              {isDemoMode ? 'Local demo storage' : 'Data storage'}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-brand-navy-soft">
              {isDemoMode
                ? 'Demo changes persist in this browser only. Storage adapters validate records and re-seed safe defaults if data is missing or invalid.'
                : 'Patient profiles, family members, policies, and appointments use Supabase with row-level security. The simulated directory catalog on this screen remains local demo data.'}
            </p>
            <dl className="mt-2 space-y-1 text-[11px]">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold text-brand-navy">Catalog key:</dt>
                <dd className="font-mono text-brand-navy-soft">medipulse.demo.admin-catalog.v1</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold text-brand-navy">Appointments key:</dt>
                <dd className="font-mono text-brand-navy-soft">
                  {isDemoMode
                    ? 'medipulse.demo.appointments.v1'
                    : 'Supabase public.appointments'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      {isDemoMode ? (
        <Card className="mt-4 border-brand-critical/20 bg-white">
          <h2 className="text-sm font-semibold text-brand-navy">Reset demo data</h2>
          <p className="mt-1 text-xs leading-relaxed text-brand-navy-soft">
            Restores the seeded simulated hospitals, doctors, insurance providers, patient
            accounts, and clears all locally booked demo appointments. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setIsResetOpen(true)}
            className={`${adminDangerButtonClass} mt-3`}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset demo data
          </button>
        </Card>
      ) : (
        <Card className="mt-4 border-brand-warning/20 bg-brand-warning-soft">
          <h2 className="text-sm font-semibold text-brand-warning">
            Supabase reset is disabled
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-brand-warning">
            This control never deletes Supabase account records. Use a controlled service-role
            maintenance script outside the browser if a test project needs resetting.
          </p>
        </Card>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-brand-navy-soft">
        MediPulse 2.0 admin console · College hackathon demo. No real patient, hospital, or
        insurance data is used or implied.
      </p>

      {isResetOpen ? (
        <ConfirmDialog
          title="Reset all demo data?"
          description={
            <>
              This restores the original simulated hospitals, doctors, insurance providers, and
              patient accounts, and removes every appointment booked in this browser. There is no
              undo.
            </>
          }
          confirmLabel="Reset demo data"
          cancelLabel="Keep my changes"
          tone="danger"
          onConfirm={handleReset}
          onClose={() => setIsResetOpen(false)}
        />
      ) : null}
    </div>
  )
}
