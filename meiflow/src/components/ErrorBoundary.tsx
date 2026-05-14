import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Em produção, aqui entraria um serviço de logging (Sentry, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'var(--status-overdue-bg)' }}
          >
            <AlertTriangle size={24} style={{ color: 'var(--status-overdue)' }} />
          </div>

          <div>
            <p className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              Algo deu errado
            </p>
            <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Ocorreu um erro inesperado nesta seção. Seus dados estão seguros — tente recarregar.
            </p>
            {this.state.error && (
              <p
                className="text-xs mt-2 font-mono px-3 py-1.5 rounded-input"
                style={{
                  color: 'var(--text-tertiary)',
                  background: 'var(--bg-2)',
                  maxWidth: 360,
                  overflowWrap: 'break-word',
                }}
              >
                {this.state.error.message}
              </p>
            )}
          </div>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--primary)' }}
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
