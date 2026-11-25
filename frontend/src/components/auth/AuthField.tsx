import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const inputClass =
  'mt-1.5 min-h-11 w-full rounded-xl border border-brand-line bg-white px-3.5 text-sm text-brand-navy shadow-sm transition placeholder:text-brand-navy-soft/45 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 focus:outline-none aria-invalid:border-brand-critical/60'

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function AuthField({
  label,
  error,
  hint,
  id,
  className,
  ...inputProps
}: AuthFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const descriptionId = `${fieldId}-description`
  const description = error ?? hint

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/75 uppercase"
      >
        {label}
      </label>
      <input
        {...inputProps}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(inputClass, className)}
      />
      {description ? (
        <p
          id={descriptionId}
          className={cn(
            'mt-1 text-[11px] leading-relaxed',
            error ? 'text-brand-critical' : 'text-brand-navy-soft/75',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function PasswordField(props: AuthFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative">
      <AuthField
        {...props}
        type={isVisible ? 'text' : 'password'}
        className={cn('pr-11', props.className)}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        className="absolute top-[30px] right-1 flex size-9 items-center justify-center rounded-lg text-brand-navy-soft transition-colors hover:bg-brand-surface hover:text-brand-navy"
      >
        {isVisible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
