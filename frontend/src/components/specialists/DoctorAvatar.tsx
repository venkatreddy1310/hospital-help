import type { Specialty } from '../../types/domain'
import { cn } from '../../utils/cn'
import { specialtyMeta } from '../../utils/specialists'

type AvatarSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-11 text-sm',
  md: 'size-14 text-base',
  lg: 'size-20 text-xl sm:size-24 sm:text-2xl',
}

interface DoctorAvatarProps {
  name: string
  specialty: Specialty
  size?: AvatarSize
  className?: string
}

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
}

export function DoctorAvatar({
  name,
  specialty,
  size = 'md',
  className,
}: DoctorAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide',
        sizeClasses[size],
        specialtyMeta[specialty].avatarClass,
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
