import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{
          fontFamily: 'monospace', padding: 32, maxWidth: 700, margin: '40px auto',
          background: '#141720', border: '1px solid #e84d6f', borderRadius: 4, color: '#e8eaf0',
        }}>
          <div style={{ color: '#e84d6f', fontWeight: 700, marginBottom: 12 }}>
            Error al cargar la aplicación
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#aaa' }}>
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
          <button
            style={{ marginTop: 20, padding: '8px 16px', background: '#4d9de8', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer' }}
            onClick={() => this.setState({ error: null })}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
