/**
 * Overlay de splash com o logo MEIFlow.
 * Componente standalone — pode ser usado em qualquer rota (dentro ou fora do AppShell).
 *
 * Por padrão fica visível por ~480ms e some com fade de 320ms.
 * Use `visible={true}` para mantê-lo até você desejar removê-lo.
 */
interface Props {
  visible: boolean
  /** Quanto tempo o logo fica 100% opaco antes de iniciar o fade-out. */
  fadeOutDelay?: number
  /** Duração do fade-out. */
  fadeOutDuration?: number
}

export default function SplashOverlay({
  visible,
  fadeOutDelay = 480,
  fadeOutDuration = 320,
}: Props) {
  if (!visible) return null
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        background: 'var(--bg-0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        animation: `pwaSplashOut ${fadeOutDuration}ms ease-out ${fadeOutDelay}ms forwards`,
      }}
    >
      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(28px, 8vw, 44px)',
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          animation: 'pwaSplashLogo 520ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        MEI<span style={{ color: 'var(--primary)' }}>Flow</span>
      </div>
    </div>
  )
}
