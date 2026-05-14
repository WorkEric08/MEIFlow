import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
}

export default function CustomSelect({
  options, value, onChange, onBlur, placeholder, error = false, disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)
  const hasValue = value !== '' && selected !== undefined

  const allOptions: SelectOption[] = placeholder
    ? [{ value: '', label: placeholder }, ...options]
    : options

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onBlur])

  function select(val: string) {
    onChange(val)
    setOpen(false)
    onBlur?.()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast flex items-center justify-between gap-2 focus:ring-1"
        style={{
          background: 'var(--bg-2)',
          color: hasValue ? 'var(--text-primary)' : 'var(--text-tertiary)',
          borderColor: error ? 'var(--status-overdue)' : 'var(--border)',
        }}
      >
        <span className="truncate">{hasValue ? selected!.label : (placeholder ?? options[0]?.label ?? '')}</span>
        <ChevronDown
          size={14}
          className="shrink-0 transition-transform duration-fast"
          style={{ color: 'var(--text-tertiary)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 rounded-card border overflow-hidden animate-fade-in"
          style={{
            background: 'var(--bg-1)',
            borderColor: 'var(--border)',
            zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
          }}
        >
          <div className="max-h-52 overflow-y-auto py-1">
            {allOptions.map((opt) => {
              const isActive = opt.value === value
              const isEmpty = opt.value === ''
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => select(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-all duration-fast',
                    !isActive && 'hover:opacity-70',
                    isActive && 'font-medium',
                  )}
                  style={{
                    background: isActive ? 'var(--primary-subtle)' : 'transparent',
                    color: isActive ? 'var(--primary)' : isEmpty ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  }}
                >
                  <span>{opt.label}</span>
                  {isActive && !isEmpty && <Check size={12} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
