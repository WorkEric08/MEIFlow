import { useEffect, useRef } from 'react'

interface Props {
  value: number
  onChange: (value: number) => void
  onBlur?: () => void
  error?: boolean
  disabled?: boolean
}

function toDigits(n: number): string {
  if (!n || n <= 0) return ''
  return Math.round(n * 100).toString()
}

function toDisplay(digits: string): string {
  if (!digits) return ''
  const reais = parseInt(digits, 10) / 100
  return reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CurrencyInput({ value, onChange, onBlur, error = false, disabled = false }: Props) {
  const digitsRef = useRef(toDigits(value))
  const internalValue = useRef(value ?? 0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync when form resets externally (e.g., modal close/open)
  useEffect(() => {
    const v = value ?? 0
    if (Math.abs(v - internalValue.current) > 0.001) {
      internalValue.current = v
      digitsRef.current = toDigits(v)
      if (inputRef.current) {
        inputRef.current.value = toDisplay(digitsRef.current)
      }
    }
  }, [value])

  function update(newDigits: string) {
    digitsRef.current = newDigits
    const num = newDigits ? parseInt(newDigits, 10) / 100 : 0
    internalValue.current = num
    if (inputRef.current) {
      inputRef.current.value = toDisplay(newDigits)
    }
    onChange(num)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      if (digitsRef.current.length >= 13) return
      const newDigits = (digitsRef.current + e.key).replace(/^0+/, '') || ''
      update(newDigits)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      update(digitsRef.current.slice(0, -1))
    }
    // Tab, Enter, Arrows etc. propagate normally
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      disabled={disabled}
      defaultValue={toDisplay(digitsRef.current)}
      placeholder="0,00"
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      onChange={() => {}}
      className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast focus:ring-1"
      style={{
        background: 'var(--bg-2)',
        color: 'var(--text-primary)',
        borderColor: error ? 'var(--status-overdue)' : 'var(--border)',
      }}
    />
  )
}
