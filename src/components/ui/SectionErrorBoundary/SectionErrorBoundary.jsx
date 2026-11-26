import { Component } from 'react'

/**
 * Error boundary for one part of a page (HEYGEN_VIDEO_EDITOR_FRONTEND_FIXES F2): a crash shows
 * a message with Retry (and optionally Back) instead of unmounting the page to a white screen.
 * `resetKey` clears the error when it changes (e.g. the active scene id).
 */
export default class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, resetKey: props.resetKey }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) {
      return { error: null, resetKey: props.resetKey }
    }
    return null
  }

  componentDidCatch(error, info) {
    console.error(this.props.label || 'Section crashed', error, info)
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    const {
      title = 'Something went wrong here.',
      hint = 'Your work is saved. Try again.',
      onBack,
      backLabel = 'Back',
      minHeight = 160,
    } = this.props

    return (
      <div
        role="alert"
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight,
          padding: 24,
          textAlign: 'center',
          color: 'var(--text-main, #0f172a)',
        }}
      >
        <div>
          <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15 }}>{title}</p>
          <p style={{ margin: '0 0 14px', color: 'var(--text-muted, #64748b)', fontSize: 13 }}>{hint}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                border: 'none',
                borderRadius: 10,
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                padding: '9px 16px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                style={{
                  border: '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: 10,
                  background: 'transparent',
                  color: 'inherit',
                  fontWeight: 600,
                  padding: '9px 16px',
                  cursor: 'pointer',
                }}
              >
                {backLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}
