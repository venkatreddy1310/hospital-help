import { Search, X } from 'lucide-react'
import { useId } from 'react'
import { cn } from '../../utils/cn'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
  className?: string
}

export function SearchBar({ value, onChange, label, placeholder, className }: SearchBarProps) {
  const inputId = useId()

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-brand-navy-soft/70"
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-brand-line bg-white pr-10 pl-10 text-sm text-brand-navy shadow-sm transition placeholder:text-brand-navy-soft/60 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 focus:outline-none"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-brand-navy-soft transition-colors hover:bg-brand-surface hover:text-brand-navy"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
