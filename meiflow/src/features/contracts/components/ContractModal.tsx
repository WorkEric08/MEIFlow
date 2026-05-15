import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Lock, Sparkles, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/shared'
import { CONTRACT_TEMPLATES } from '../templates'
import { usePlanGate } from '@/hooks/usePlanGate'
import UpgradeModal from '@/components/UpgradeModal'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * Tela inicial de criação de contrato.
 * Pergunta "como começar" — modelo pronto ou em branco — e navega
 * para a página dedicada de edição. Linguagem direta, cards grandes
 * e descrições para que mesmo quem não é técnico entenda na primeira leitura.
 */
export default function ContractModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const planGate = usePlanGate()
  const [upgradeReason, setUpgradeReason] = useState('')

  function go(target: string) {
    onClose()
    navigate(target)
  }

  return (
    <>
      <UpgradeModal
        open={!!upgradeReason}
        onClose={() => setUpgradeReason('')}
        reason={upgradeReason}
      />
      <Modal open={open} onClose={onClose} title="Como você quer começar?" size="lg">
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Escolha um modelo pronto para acelerar — você pode mudar tudo depois.
            Ou comece com uma folha em branco e escreva do seu jeito.
          </p>

          {/* ── Em branco (em destaque) ── */}
          <button
            onClick={() => go('/contracts/new')}
            data-pwa-tap
            className="flex items-center gap-4 p-4 sm:p-5 rounded-card border-2 text-left transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              background: 'var(--primary-subtle)',
              borderColor: 'var(--blueprint-border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-input flex items-center justify-center shrink-0 text-xl"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              <Sparkles size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Começar em branco
                </p>
              </div>
              <p className="text-xs sm:text-sm mt-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                Folha vazia para escrever o contrato do zero, com formatação visual.
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0" style={{ color: 'var(--primary)' }} />
          </button>

          {/* ── Separador ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
              Modelos prontos
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* ── Templates ── */}
          <div className="flex flex-col gap-2.5">
            {CONTRACT_TEMPLATES.map((t, idx) => {
              const gate = planGate.check('contract-template', idx)
              const locked = !gate.allowed
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (locked) { setUpgradeReason(gate.reason); return }
                    go(`/contracts/new?template=${t.id}`)
                  }}
                  data-pwa-tap
                  className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-card border text-left transition-all hover:opacity-90 active:scale-[0.99]"
                  style={{
                    background: 'var(--bg-2)',
                    borderColor: 'var(--border)',
                    opacity: locked ? 0.7 : 1,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-input flex items-center justify-center shrink-0 text-xl select-none"
                    style={{
                      background: locked ? 'var(--bg-1)' : 'var(--primary-subtle)',
                      color: locked ? 'var(--text-tertiary)' : 'var(--primary)',
                    }}
                  >
                    {locked ? <Lock size={18} /> : <span aria-hidden>{t.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        {t.name}
                      </p>
                      <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-badge"
                        style={{ background: 'var(--bg-1)', color: 'var(--text-tertiary)' }}>
                        {t.category}
                      </span>
                      {locked && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-badge"
                          style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {t.description}
                    </p>
                  </div>
                  {!locked && (
                    <ChevronRight size={18} className="shrink-0 mt-1.5" style={{ color: 'var(--text-tertiary)' }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Dica simpática para quem é mais leigo ── */}
          <div
            className="flex items-start gap-3 p-3 rounded-card border"
            style={{
              background: 'var(--bg-2)',
              borderColor: 'var(--border)',
              borderStyle: 'dashed',
            }}
          >
            <FileText size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              Você pode editar qualquer texto depois — incluindo trocar nomes, valores, prazos e cláusulas inteiras.
              É só clicar e escrever.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
