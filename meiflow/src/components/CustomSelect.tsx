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

const OPTION_HEIGHT = 41  // py-2.5 + texto ~= 41px por opção
const DROPDOWN_PADDING = 8
const MAX_DROPDOWN_H = 208 // max-h-52

export default function CustomSelect({
  options, value, onChange, onBlur, placeholder, error = false, disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = options.find((o) => o.value === value)
  const hasValue = value !== '' && selected !== undefined

  const allOptions: SelectOption[] = placeholder
    ? [{ value: '', label: placeholder }, ...options]
    : options

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onBlur])

  function handleToggle() {
    if (disabled) return
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const dropdownH = Math.min(allOptions.length * OPTION_HEIGHT + DROPDOWN_PADDING, MAX_DROPDOWN_H)
      const spaceBelow = window.innerHeight - rect.bottom
      const shouldOpenUp = spaceBelow < dropdownH + 8

      setOpenUpward(shouldOpenUp)

      // Se o próprio trigger estiver cortado, garante visibilidade
      if (shouldOpenUp) {
        triggerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
    setOpen((v) => !v)
  }

  function select(val: string) {
    onChange(val)
    setOpen(false)
    onBlur?.()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
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
          className={cn(
            'absolute left-0 right-0 rounded-card border overflow-hidden animate-fade-in',
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
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
