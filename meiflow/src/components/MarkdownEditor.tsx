import { useRef } from 'react'
import { Bold, Heading2, List, Minus, Type } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  rows?: number
  error?: boolean
}

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  prefix: string
  suffix?: string
  block?: boolean
  placeholder?: string
}

const ACTIONS: ToolbarAction[] = [
  { icon: <Heading2 size={14} />, label: 'Título',    prefix: '## ',       block: true,  placeholder: 'Título da seção' },
  { icon: <Bold size={14} />,     label: 'Negrito',   prefix: '**',        suffix: '**', placeholder: 'texto em negrito' },
  { icon: <Type size={14} />,     label: 'Itálico',   prefix: '*',         suffix: '*',  placeholder: 'texto em itálico' },
  { icon: <List size={14} />,     label: 'Lista',     prefix: '- ',        block: true,  placeholder: 'item da lista' },
  { icon: <Minus size={14} />,    label: 'Divisor',   prefix: '\n---\n',   block: true },
]

export default function MarkdownEditor({ value, onChange, rows = 14, error }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function applyAction(action: ToolbarAction) {
    const el = ref.current
    if (!el) return

    const start  = el.selectionStart
    const end    = el.selectionEnd
    const before = value.slice(0, start)
    const sel    = value.slice(start, end)
    const after  = value.slice(end)

    let insert: string
    let newCursor: number

    if (action.block) {
      const lineStart = before.lastIndexOf('\n') + 1
      const lineText  = sel || action.placeholder || ''
      insert = before.slice(0, lineStart) + action.prefix + before.slice(lineStart) + lineText + after
      newCursor = lineStart + action.prefix.length + lineText.length
    } else {
      const inner = sel || action.placeholder || ''
      insert = before + action.prefix + inner + (action.suffix ?? '') + after
      newCursor = start + action.prefix.length + inner.length + (action.suffix?.length ?? 0)
    }

    onChange(insert)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(newCursor, newCursor)
    })
  }

  return (
    <div className="flex flex-col rounded-input border overflow-hidden"
      style={{ borderColor: error ? 'var(--status-overdue)' : 'var(--border)' }}>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b"
        style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.label}
            onClick={() => applyAction(action)}
            className="flex items-center justify-center w-7 h-7 rounded transition-all hover:opacity-70"
            style={{ color: 'var(--text-secondary)', background: 'transparent' }}
          >
            {action.icon}
          </button>
        ))}
        <div className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Markdown
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2.5 text-xs outline-none resize-y font-mono"
        style={{
          background: 'var(--bg-2)',
          color: 'var(--text-primary)',
          lineHeight: '1.7',
          borderColor: 'transparent',
        }}
        placeholder="Escreva o conteúdo do contrato…"
        spellCheck={false}
      />
    </div>
  )
}
