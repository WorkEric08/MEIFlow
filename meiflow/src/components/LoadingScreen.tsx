export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
        />
        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Carregando…
        </span>
      </div>
    </div>
  )
}
