import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../utils/cn'

export const profileInputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-brand-line bg-white px-3 text-sm text-brand-navy shadow-sm transition placeholder:text-brand-navy-soft/45 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 focus:outline-none aria-invalid:border-brand-critical/60'

export const profileLabelClass =
  'text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/75 uppercase'

interface FieldShellProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  optional?: boolean
  children: ReactNode
  className?: string
}

function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
  className,
}: FieldShellProps) {
  const description = error ?? hint
  const descriptionId = `${htmlFor}-description`

  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={profileLabelClass}>
        {label}
        {optional ? (
          <span className="ml-1 font-medium normal-case tracking-normal text-brand-navy-soft/55">
            optional
          </span>
        ) : null}
      </label>
      {children}
      {description ? (
        <p
          id={descriptionId}
          className={cn(
            'mt-1 text-[10px] leading-relaxed',
            error ? 'text-brand-critical' : 'text-brand-navy-soft/70',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  fieldId: string
  error?: string
  hint?: string
  optional?: boolean
  fieldClassName?: string
}

export function FormInput({
  label,
  fieldId,
  error,
  hint,
  optional,
  fieldClassName,
  className,
  ...props
}: FormInputProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      error={error}
      hint={hint}
      optional={optional}
      className={fieldClassName}
    >
      <input
        {...props}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${fieldId}-description` : undefined}
        className={cn(profileInputClass, className)}
      />
    </FieldShell>
  )
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  fieldId: string
  error?: string
  hint?: string
  optional?: boolean
  fieldClassName?: string
  children: ReactNode
}

export function FormSelect({
  label,
  fieldId,
  error,
  hint,
  optional,
  fieldClassName,
  className,
  children,
  ...props
}: FormSelectProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      error={error}
      hint={hint}
      optional={optional}
      className={fieldClassName}
    >
      <select
        {...props}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${fieldId}-description` : undefined}
        className={cn(profileInputClass, className)}
      >
        {children}
      </select>
    </FieldShell>
  )
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  fieldId: string
  error?: string
  hint?: string
  optional?: boolean
  fieldClassName?: string
}

export function FormTextarea({
  label,
  fieldId,
  error,
  hint,
  optional,
  fieldClassName,
  className,
  ...props
}: FormTextareaProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      error={error}
      hint={hint}
      optional={optional}
      className={fieldClassName}
    >
      <textarea
        {...props}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${fieldId}-description` : undefined}
        className={cn(profileInputClass, 'resize-y py-2.5', className)}
      />
    </FieldShell>
  )
}
