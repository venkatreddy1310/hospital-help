import { getProfileInitials } from '../../utils/account'
import { cn } from '../../utils/cn'

interface PatientAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
}

export function PatientAvatar({
  name,
  size = 'md',
  className,
}: PatientAvatarProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl bg-brand-blue-soft font-bold text-brand-blue',
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    >
      {getProfileInitials(name) || 'MP'}
    </span>
  )
}
