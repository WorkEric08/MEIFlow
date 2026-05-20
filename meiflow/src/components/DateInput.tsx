import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import {
  format, parseISO, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, subMonths, isSameMonth, isSameDay, isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  value: string
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
  const [pending, setPending] = useState<Date | null>(parsed)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  // Swipe tracking
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const gridRef = useRef<HTMLDivElement>(null)

  // Sync pending when opening
  useEffect(() => {
    if (open) {
      const p = value ? parseISO(value) : null
      setPending(p)
      setViewing(p ?? new Date())
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const monthStart = startOfMonth(viewing)
  const monthEnd   = endOfMonth(viewing)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd    = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd })

  function openCalendar() {
    if (disabled) return
    setOpen(true)
  }

  function close() {
    setOpen(false)
    onBlur?.()
  }

  function goToPrev() {
    setSlideDir('right')
    setViewing(subMonths(viewing, 1))
    setTimeout(() => setSlideDir(null), 300)
  }

  function goToNext() {
    setSlideDir('left')
    setViewing(addMonths(viewing, 1))
    setTimeout(() => setSlideDir(null), 300)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 44) {
      if (deltaX < 0) goToNext()
      else goToPrev()
    }
  }

  function save() {
    if (pending) {
      onChange(format(pending, 'yyyy-MM-dd'))
    }
    close()
  }

  const monthLabel   = format(viewing, 'MMMM yyyy', { locale: ptBR })
  const displayLabel = parsed ? format(parsed, 'dd/MM/yyyy') : ''

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={openCalendar}
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

      {open && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{
              zIndex: 10000,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              background: 'rgba(0,0,0,0.25)',
            }}
            onClick={close}
          />

          {/* Calendário — portal garante centralização mesmo dentro de modais com transform */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[16px] border flex flex-col overflow-hidden"
            style={{
              animation: 'overlay-in 180ms ease-out',
              background: 'var(--bg-1)',
              borderColor: 'var(--border)',
              zIndex: 10001,
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              width: 'min(360px, calc(100vw - 32px))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do mês */}
            <div
              className="flex items-center justify-between px-4 py-3.5 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goToPrev() }}
                className="w-9 h-9 flex items-center justify-center rounded-input transition-all hover:opacity-70 active:scale-95"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-2)' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span
                className="text-sm font-semibold capitalize select-none"
                style={{ color: 'var(--text-primary)' }}
              >
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goToNext() }}
                className="w-9 h-9 flex items-center justify-center rounded-input transition-all hover:opacity-70 active:scale-95"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-2)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Grid com swipe */}
            <div
              ref={gridRef}
              className="px-3 pt-2 pb-1 select-none"
              style={{
                transform: slideDir === 'left'
                  ? 'translateX(-6px)'
                  : slideDir === 'right'
                    ? 'translateX(6px)'
                    : 'translateX(0)',
                transition: slideDir ? 'transform 200ms ease-out, opacity 200ms ease-out' : 'none',
                opacity: slideDir ? 0.6 : 1,
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Labels dos dias da semana */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map((d) => (
                  <div
                    key={d}
                    className="text-center py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Dias */}
              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day) => {
                  const isSelected = pending ? isSameDay(day, pending) : false
                  const inMonth    = isSameMonth(day, viewing)
                  const todayDay   = isToday(day)

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPending(day) }}
                      className="relative h-10 w-full flex items-center justify-center rounded-[10px] text-sm font-medium transition-all duration-fast active:scale-95"
                      style={{
                        background: isSelected
                          ? 'var(--primary)'
                          : todayDay && !isSelected
                            ? 'var(--primary-subtle)'
                            : 'transparent',
                        color: isSelected
                          ? '#fff'
                          : todayDay
                            ? 'var(--primary)'
                            : inMonth
                              ? 'var(--text-primary)'
                              : 'var(--text-tertiary)',
                        fontWeight: isSelected || todayDay ? 700 : 400,
                        opacity: inMonth ? 1 : 0.3,
                        boxShadow: isSelected
                          ? '0 2px 8px rgba(var(--primary-rgb, 59,140,232), 0.4)'
                          : 'none',
                        outline: todayDay && !isSelected
                          ? '1.5px solid var(--primary)'
                          : 'none',
                        outlineOffset: '-1px',
                      }}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer — botão Salvar */}
            <div
              className="flex items-center justify-between px-4 py-3 border-t gap-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {pending
                  ? format(pending, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : 'Nenhuma data selecionada'}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); save() }}
                disabled={!pending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ background: 'var(--primary)' }}
              >
                Salvar
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
