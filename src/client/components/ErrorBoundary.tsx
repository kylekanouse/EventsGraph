import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('EventsGraph Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 20, color: '#fff', background: '#333' }}>
        <h2>Something went wrong</h2>
        <p>{this.state.error?.message}</p>
        <button onClick={() => this.setState({ hasError: false })}>Retry</button>
      </div>
    }
    return this.props.children
  }
}
