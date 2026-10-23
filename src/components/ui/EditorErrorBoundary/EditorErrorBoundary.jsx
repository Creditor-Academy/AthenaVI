import { Component } from 'react'

/**
 * Keeps the PPT/canvas chrome mounted when a selected image's style/mask throws.
 */
export default class EditorErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(this.props.label || 'Editor crashed', error, info)
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            display: 'grid',
            placeItems: 'center',
            minHeight: '40vh',
            padding: 32,
            textAlign: 'center',
            color: '#0f172a',
          }}
        >
          <div>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 16 }}>
              The editor hit an error. Your deck is still saved.
            </p>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14 }}>
              Try again, or deselect the image and continue editing.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                border: 'none',
                borderRadius: 10,
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                padding: '10px 16px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
