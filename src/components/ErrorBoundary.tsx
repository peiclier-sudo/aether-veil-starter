import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
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

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleClearData = () => {
    localStorage.removeItem('aether-veil-storage')
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a060f] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-6xl">💥</div>
            <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            <p className="text-sm text-white/50">
              An unexpected error occurred. You can try again or reset your game data if the issue persists.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-400/70 bg-red-500/10 rounded-lg p-3 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm rounded-xl hover:brightness-110 active:scale-95 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={this.handleClearData}
                className="px-6 py-3 bg-white/10 text-white/70 font-medium text-sm rounded-xl hover:bg-white/20 active:scale-95 transition-all"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
