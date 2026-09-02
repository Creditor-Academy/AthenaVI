/**
 * Picker thumbnails for quote / testimonial layouts.
 * Canvas compile is unchanged — these only mirror the real geometries.
 */
import { aspectRatioToCss } from '../../utils/deckPackTheme'

const theme = {
  bg: 'var(--preview-bg, var(--bg-card, #ffffff))',
  text: 'var(--preview-text, var(--text-main, #1f1f1f))',
  muted: 'var(--preview-muted, var(--text-muted, #6f6f6f))',
  mark: '#1E3A5F',
  cardBorder: '#E5E7EB',
  avatar: '#C5CDD8',
  photo: '#e2e8f0',
}

function frameProps({ large, fill, aspectRatio, className, style }) {
  const frameStyle = fill
    ? { width: '100%', height: '100%', aspectRatio: 'unset' }
    : { width: '100%', aspectRatio: aspectRatioToCss(aspectRatio) }
  return {
    className,
    style: {
      position: 'relative',
      ...frameStyle,
      background: theme.bg,
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: large ? 12 : 6,
      boxSizing: 'border-box',
      ...style,
    },
  }
}

function quoteCopy(previewHints) {
  return {
    quote:
      previewHints.quoteText ||
      'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.',
    author: previewHints.authorName || 'Gemine Macberry',
    title: previewHints.authorTitle || 'VP of Engineering at Acme Inc.',
  }
}

function QuoteMark({ large, compact = false }) {
  return (
    <div style={{
      fontSize: large ? (compact ? '1.6rem' : '2.2rem') : compact ? '0.55rem' : '0.72rem',
      color: theme.mark,
      fontWeight: 700,
      lineHeight: 0.85,
      fontFamily: 'Georgia, serif',
    }}>
      &ldquo;
    </div>
  )
}

function AttributionRow({ large, author, title, compact = false }) {
  const av = large ? (compact ? 22 : 28) : compact ? 8 : 11
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: large ? 8 : 3, marginTop: 'auto' }}>
      <div style={{
        width: av,
        height: av,
        borderRadius: '50%',
        background: theme.avatar,
        flexShrink: 0,
        boxShadow: 'inset 0 0 0 1px #9AA3B2',
      }} />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: large ? (compact ? '0.58rem' : '0.7rem') : '0.22rem',
          fontWeight: 700,
          color: theme.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {author}
        </div>
        <div style={{
          fontSize: large ? (compact ? '0.46rem' : '0.54rem') : '0.16rem',
          color: theme.muted,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {title}
        </div>
      </div>
    </div>
  )
}

/** Statement Left — quote occupies the left half of the card. */
export function PolishedStatementLeftPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const { quote, author, title } = quoteCopy(previewHints)
  return (
    <div {...fp} style={{ ...fp.style, padding: large ? '7%' : '8% 6%', display: 'flex' }}>
      <div style={{
        width: large ? '52%' : '50%',
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 10 : 3,
        minWidth: 0,
      }}>
        <QuoteMark large={large} />
        <div style={{
          fontSize: large ? '0.92rem' : '0.3rem',
          color: theme.text,
          lineHeight: 1.4,
          fontWeight: 700,
          fontStyle: 'italic',
        }}>
          {quote}
        </div>
        <AttributionRow large={large} author={author} title={title} />
      </div>
    </div>
  )
}

/** Statement Large — wide quote, larger type, full card. */
export function PolishedStatementLargePreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const { quote, author, title } = quoteCopy(previewHints)
  return (
    <div {...fp} style={{
      ...fp.style,
      padding: large ? '6% 8%' : '8% 6%',
      display: 'flex',
      flexDirection: 'column',
      gap: large ? 12 : 4,
    }}>
      <QuoteMark large={large} />
      <div style={{
        fontSize: large ? '1.15rem' : '0.38rem',
        color: theme.text,
        lineHeight: 1.35,
        fontWeight: 700,
        fontStyle: 'italic',
        maxWidth: '88%',
      }}>
        {quote}
      </div>
      <AttributionRow large={large} author={author} title={title} />
    </div>
  )
}

/** Quote portrait — same family as large, slightly tighter quote width. */
export function PolishedQuotePortraitPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const { quote, author, title } = quoteCopy(previewHints)
  return (
    <div {...fp} style={{
      ...fp.style,
      padding: large ? '6% 8%' : '8% 6%',
      display: 'flex',
      flexDirection: 'column',
      gap: large ? 10 : 3,
    }}>
      <QuoteMark large={large} />
      <div style={{
        fontSize: large ? '1.02rem' : '0.34rem',
        color: theme.text,
        lineHeight: 1.4,
        fontWeight: 700,
        fontStyle: 'italic',
        maxWidth: '72%',
      }}>
        {quote}
      </div>
      <AttributionRow large={large} author={author} title={title} />
    </div>
  )
}

/** Testimonial card — smaller centered card with shadow. */
export function PolishedQuoteTestimonialPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const { quote, author, title } = quoteCopy(previewHints)
  return (
    <div {...fp} style={{
      ...fp.style,
      padding: large ? '10% 12%' : '12% 10%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F3F4F6',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        borderRadius: large ? 14 : 6,
        border: '1px solid #E5E7EB',
        boxShadow: large ? '0 12px 28px rgba(15,23,42,0.08)' : '0 4px 10px rgba(15,23,42,0.08)',
        padding: large ? '10% 9%' : '9% 8%',
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 8 : 3,
        boxSizing: 'border-box',
      }}>
        <QuoteMark large={large} compact />
        <div style={{
          fontSize: large ? '0.78rem' : '0.26rem',
          color: theme.text,
          lineHeight: 1.4,
          fontWeight: 600,
          fontStyle: 'italic',
          flex: 1,
        }}>
          {quote}
        </div>
        <AttributionRow large={large} author={author} title={title} compact />
      </div>
    </div>
  )
}

/** Quote with attribution — copy on the left, portrait photo on the right. */
export function PolishedQuoteAttributionSplitPreview({ previewHints, ...props }) {
  const { large } = props
  const fp = frameProps(props)
  const { quote, author, title } = quoteCopy(previewHints)
  return (
    <div {...fp} style={{ ...fp.style, display: 'flex', padding: 0 }}>
      <div style={{
        width: '58%',
        padding: large ? '8% 7%' : '9% 6%',
        display: 'flex',
        flexDirection: 'column',
        gap: large ? 10 : 3,
        boxSizing: 'border-box',
      }}>
        <QuoteMark large={large} />
        <div style={{
          fontSize: large ? '0.88rem' : '0.28rem',
          color: theme.text,
          lineHeight: 1.4,
          fontWeight: 700,
          fontStyle: 'italic',
        }}>
          {quote}
        </div>
        <AttributionRow large={large} author={author} title={title} />
      </div>
      <div style={{
        width: '42%',
        background: theme.photo,
        borderRadius: large ? '0 12px 12px 0' : '0 6px 6px 0',
      }} />
    </div>
  )
}

export const QUOTE_PREVIEW_MODES = {
  statement_left: PolishedStatementLeftPreview,
  statement_large: PolishedStatementLargePreview,
  quote_portrait: PolishedQuotePortraitPreview,
  quote_testimonial: PolishedQuoteTestimonialPreview,
  quote_attribution_split: PolishedQuoteAttributionSplitPreview,
}
