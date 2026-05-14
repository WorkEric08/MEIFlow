import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Modal } from '@/components/shared'

interface Props {
  open: boolean
  onClose: () => void
  reason: string
}

const PLAN_ROWS = [
  { label: 'Clientes',                free: '3',   pro: 'Ilimitado', freeNeg: false },
  { label: 'Projetos ativos',         free: '2',   pro: 'Ilimitado', freeNeg: false },
  { label: 'Templates de contrato',   free: '1',   pro: '4',         freeNeg: false },
  { label: 'Marca d\'água nos PDFs',  free: 'Sim', pro: 'Não',       freeNeg: true  },
  { label: 'Marca d\'água Link Page', free: 'Sim', pro: 'Não',       freeNeg: true  },
]

export default function UpgradeModal({ open, onClose, reason }: Props) {
  const navigate = useNavigate()

  function handleUpgrade() {
    navigate('/settings#upgrade')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Upgrade para o Pro" size="sm">
      <div className="flex flex-col gap-5">
        <div
          className="flex items-start gap-3 p-3.5 rounded-card border"
          style={{ background: 'var(--primary-subtle)', borderColor: 'var(--primary)' }}
        >
          <Sparkles size={15} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{reason}</p>
        </div>

        <div className="rounded-card border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--bg-2)' }}>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Recurso</th>
                <th className="text-center px-3 py-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Gratuito</th>
                <th className="text-center px-3 py-2 font-semibold" style={{ color: 'var(--primary)' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_ROWS.map(({ label, free, pro, freeNeg }, i) => (
                <tr
                  key={label}
                  style={{ background: i % 2 === 0 ? 'var(--bg-1)' : 'var(--bg-2)' }}
                >
                  <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{label}</td>
                  <td className="text-center px-3 py-2 font-medium" style={{ color: freeNeg ? 'var(--status-overdue)' : 'var(--text-secondary)' }}>
                    {free}
                  </td>
                  <td className="text-center px-3 py-2 font-semibold" style={{ color: 'var(--primary)' }}>
                    {pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleUpgrade}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--primary)' }}
          >
            <Sparkles size={14} />
            Assinar Pro — R$ 29/mês
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-input text-sm font-medium transition-all hover:opacity-70"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Continuar no gratuito
          </button>
        </div>
      </div>
    </Modal>
  )
}
