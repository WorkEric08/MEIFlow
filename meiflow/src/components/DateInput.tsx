import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import {
  format, parseISO, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, subMonths, isSameMonth, isSameDay, isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  value: string   // YYYY-MM-DD or ''
  onChange: (value: string) => void
  onBlur?: () => void
  error?: boolean
  disabled?: boolean
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function DateInput({ value, onChange, onBlur, error = false, disabled = false }: Props) {
  const parsed = value ? parseISO(value) : null
  const [open, setOpen] = useState(false)
  const [viewing, setViewing] = useState(parsed ?? new Date())
  const [hovered, setHovered] = useState<Date | null>(null)

  const monthStart = startOfMonth(viewing)
  const monthEnd   = endOfMonth(viewing)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd    = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd })

  function open_() {
    if (disabled) return
    if (parsed) setViewing(parsed)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    onBlur?.()
  }

  function pickDay(day: Date) {
    onChange(format(day, 'yyyy-MM-dd'))
    close()
  }

  const monthLabel  = format(viewing, 'MMMM yyyy', { locale: ptBR })
  const displayLabel = parsed ? format(parsed, 'dd/MM/yyyy') : ''

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={open_}
        className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast flex items-center justify-between gap-2 focus:ring-1"
        style={{
          background: 'var(--bg-2)',
          color: displayLabel ? 'var(--text-primary)' : 'var(--text-tertiary)',
          borderColor: error ? 'var(--status-overdue)' : 'var(--border)',
        }}
      >
        <span>{displayLabel || 'DD/MM/AAAA'}</span>
        <Calendar size={14} className="shrink-0" style={{ color: 'var(--text-tertiary)' }} />
      </button>

      {open && (
        <>
          {/* Backdrop com blur — fecha o calendário */}
          <div
            className="fixed inset-0"
            style={{
              zIndex: 10000,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              background: 'rgba(0,0,0,0.18)',
            }}
            onClick={close}
          />

          {/* Calendário centralizado */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-card border"
            style={{
              animation: 'overlay-in 180ms ease-out',
              background: 'var(--bg-1)',
              borderColor: 'var(--border)',
              zIndex: 10001,
              boxShadow: '0 16px 48px rgba(0,0,0,0.32)',
              minWidth: '280px',
            }}
          >
            {/* Navegação de mês */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewing(subMonths(viewing, 1)) }}
                className="p-1.5 rounded-input transition-all hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewing(addMonths(viewing, 1)) }}
                className="p-1.5 rounded-input transition-all hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Cabeçalho dos dias */}
            <div className="grid grid-cols-7 px-2 pt-2">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--text-tertiary)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-0.5 px-2 pb-2">
              {days.map((day) => {
                const isSelected  = parsed ? isSameDay(day, parsed) : false
                const inMonth     = isSameMonth(day, viewing)
                const todayDay    = isToday(day)
                const isHovered   = hovered ? isSameDay(day, hovered) : false

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); pickDay(day) }}
                    onMouseEnter={() => setHovered(day)}
                    onMouseLeave={() => setHovered(null)}
                    className="h-9 w-full rounded-input text-xs transition-all duration-fast"
                    style={{
                      background: isSelected
                        ? 'var(--primary)'
                        : todayDay
                          ? 'var(--primary-subtle)'
                          : isHovered
                            ? 'var(--bg-2)'
                            : 'transparent',
                      color: isSelected
                        ? '#fff'
                        : todayDay
                          ? 'var(--primary)'
                          : inMonth
                            ? 'var(--text-primary)'
                            : 'var(--text-tertiary)',
                      fontWeight: todayDay ? 600 : 400,
                      opacity: inMonth ? 1 : 0.35,
                      outline: todayDay && !isSelected ? '1px solid var(--primary)' : 'none',
                      outlineOffset: '-1px',
                    }}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
