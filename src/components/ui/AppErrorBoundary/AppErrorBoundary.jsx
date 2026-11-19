import { Component } from 'react'
import { isChunkLoadError } from '../../../utils/lazyWithReload'

/**
 * Last line of defence for the whole app: a page that fails to load or crashes shows a message
 * with Reload instead of a blank white screen. `resetKey` (the current view) clears it when the
 * user moves to another page.
 */
export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Page failed to load', error, info)
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const newVersion = isChunkLoadError(error)
    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: '#f8fafc',
          textAlign: 'center',
          color: '#0f172a',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 18 }}>
            {newVersion ? 'This page couldn’t load' : 'Something went wrong'}
          </p>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
            {newVersion
              ? 'Athena may have just been updated, or the connection dropped. Reload to get the latest version. You’re still signed in.'
              : 'Reload the page to continue. You’re still signed in.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              border: 'none',
              borderRadius: 10,
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              padding: '10px 18px',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
