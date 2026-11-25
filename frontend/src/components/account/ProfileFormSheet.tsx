import { TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAccount } from '../../context/accountStore'
import {
  familyRelationships,
  type CareProfile,
  type FamilyRelationship,
} from '../../types/account'
import {
  bloodGroupOptions,
  emptyProfileForm,
  formToPatientDetails,
  genderOptions,
  profileToForm,
  validateProfileForm,
  type ProfileFieldErrors,
  type ProfileFormValues,
} from '../../utils/account'
import { BottomSheet } from '../ui/BottomSheet'
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from './FormFields'

interface ProfileFormSheetProps {
  kind: 'self' | 'family'
  profile?: CareProfile
  defaultRelationship?: FamilyRelationship
  onClose: () => void
  onSaved: (message: string) => void
}

function getTodayISO(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function ProfileFormSheet({
  kind,
  profile,
  defaultRelationship,
  onClose,
  onSaved,
}: ProfileFormSheetProps) {
  const { saveSelfProfile, addFamilyMember, updateFamilyMember } = useAccount()
  const [form, setForm] = useState<ProfileFormValues>(() =>
    profile ? profileToForm(profile) : emptyProfileForm,
  )
  const [relationship, setRelationship] = useState<
    FamilyRelationship | ''
  >(
    profile?.kind === 'family'
      ? profile.relationship
      : (defaultRelationship ?? ''),
  )
  const [errors, setErrors] = useState<ProfileFieldErrors>({})
  const [relationshipError, setRelationshipError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(profile)
  const title =
    kind === 'self'
      ? isEditing
        ? 'Edit personal profile'
        : 'Create personal profile'
      : isEditing
        ? 'Edit family member'
        : 'Add a family member'

  const setField = <Key extends keyof ProfileFormValues>(
    key: Key,
    value: ProfileFormValues[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setServerError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)

    const nextErrors = validateProfileForm(form, kind)
    const nextRelationshipError =
      kind === 'family' && !relationship ? 'Choose a relationship.' : null

    setErrors(nextErrors)
    setRelationshipError(nextRelationshipError)

    if (Object.keys(nextErrors).length > 0 || nextRelationshipError) return

    setIsSubmitting(true)
    const details = formToPatientDetails(form)
    let error: string | null

    if (kind === 'self') {
      error = await saveSelfProfile(details)
    } else if (isEditing && profile) {
      error = await updateFamilyMember(profile.id, {
        ...details,
        relationship: relationship as FamilyRelationship,
      })
    } else {
      error = await addFamilyMember({
        ...details,
        relationship: relationship as FamilyRelationship,
      })
    }

    setIsSubmitting(false)

    if (error) {
      setServerError(error)
      return
    }

    onSaved(
      kind === 'self'
        ? 'Personal profile saved.'
        : isEditing
          ? 'Family profile updated.'
          : 'Family member added.',
    )
    onClose()
  }

  return (
    <BottomSheet
      title={title}
      description="Use simulated information only. These details stay associated with your signed-in account."
      onClose={onClose}
      panelClassName="sm:max-w-2xl"
    >
      <form noValidate onSubmit={handleSubmit} className="mt-4">
        {serverError ? (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-brand-critical/20 bg-brand-critical-soft px-3.5 py-3 text-xs font-medium text-brand-critical"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {serverError}
          </p>
        ) : null}

        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormInput
            label="Full name"
            fieldId="profile-full-name"
            autoComplete="name"
            placeholder="Patient full name"
            value={form.fullName}
            onChange={(event) => setField('fullName', event.target.value)}
            error={errors.fullName}
            fieldClassName="sm:col-span-2"
          />
          {kind === 'family' ? (
            <FormSelect
              label="Relationship"
              fieldId="profile-relationship"
              value={relationship}
              onChange={(event) => {
                setRelationship(event.target.value as FamilyRelationship | '')
                setRelationshipError(null)
              }}
              error={relationshipError ?? undefined}
              fieldClassName="sm:col-span-2"
            >
              <option value="">Select relationship</option>
              {familyRelationships.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </FormSelect>
          ) : null}
          <FormInput
            label="Date of birth"
            fieldId="profile-dob"
            type="date"
            max={getTodayISO()}
            value={form.dateOfBirth}
            onChange={(event) => setField('dateOfBirth', event.target.value)}
            error={errors.dateOfBirth}
          />
          <FormSelect
            label="Gender"
            fieldId="profile-gender"
            value={form.gender}
            onChange={(event) =>
              setField('gender', event.target.value as ProfileFormValues['gender'])
            }
            error={errors.gender}
          >
            <option value="">Select gender</option>
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Blood group"
            fieldId="profile-blood-group"
            value={form.bloodGroup}
            onChange={(event) =>
              setField(
                'bloodGroup',
                event.target.value as ProfileFormValues['bloodGroup'],
              )
            }
            error={errors.bloodGroup}
          >
            <option value="">Select blood group</option>
            {bloodGroupOptions.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Phone"
            fieldId="profile-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(event) => setField('phone', event.target.value)}
            error={errors.phone}
            optional={kind === 'family'}
          />
          <FormInput
            label="Address"
            fieldId="profile-address"
            autoComplete="street-address"
            placeholder="House, street, area"
            value={form.addressLine}
            onChange={(event) => setField('addressLine', event.target.value)}
            error={errors.addressLine}
            optional={kind === 'family'}
            fieldClassName="sm:col-span-2"
          />
          <FormInput
            label="City"
            fieldId="profile-city"
            autoComplete="address-level2"
            placeholder="Hyderabad"
            value={form.city}
            onChange={(event) => setField('city', event.target.value)}
            error={errors.city}
            optional={kind === 'family'}
          />
          <div className="hidden sm:block" aria-hidden="true" />
          <FormInput
            label="Emergency contact name"
            fieldId="profile-emergency-name"
            placeholder="Contact full name"
            value={form.emergencyContactName}
            onChange={(event) =>
              setField('emergencyContactName', event.target.value)
            }
            error={errors.emergencyContactName}
            optional={kind === 'family'}
          />
          <FormInput
            label="Emergency contact phone"
            fieldId="profile-emergency-phone"
            type="tel"
            placeholder="+91 90000 11223"
            value={form.emergencyContactPhone}
            onChange={(event) =>
              setField('emergencyContactPhone', event.target.value)
            }
            error={errors.emergencyContactPhone}
            optional={kind === 'family'}
          />
          <FormTextarea
            label="Allergies"
            fieldId="profile-allergies"
            rows={2}
            placeholder="Separate with commas, or leave blank"
            value={form.allergies}
            onChange={(event) => setField('allergies', event.target.value)}
            error={errors.allergies}
            hint="Demo information only, not a clinical allergy record."
            optional
          />
          <FormTextarea
            label="Medical conditions"
            fieldId="profile-conditions"
            rows={2}
            placeholder="Separate with commas, or leave blank"
            value={form.medicalConditions}
            onChange={(event) => setField('medicalConditions', event.target.value)}
            error={errors.medicalConditions}
            hint="Optional self-reported demo conditions."
            optional
          />
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Saving…'
              : kind === 'self'
                ? 'Save personal profile'
                : isEditing
                  ? 'Save family member'
                  : 'Add family member'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
